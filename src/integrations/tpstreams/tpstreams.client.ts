import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TpstreamsCreateAssetRequest,
  TpstreamsCreateAssetResponse,
  TpstreamsCreateFolderRequest,
  TpstreamsCreateFolderResponse,
  TpstreamsError,
  TpstreamsErrorCode,
  TpstreamsLoginResponse,
} from './tpstreams.types';
import { TPSTREAMS_DEFAULTS, TPSTREAMS_PATHS } from './tpstreams.constants';

type TokenState = {
  token: string | null;
  expiresAt: number | null; // epoch ms
  loginInFlight: Promise<void> | null;
};

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function isAxiosHeaders(h: unknown): h is AxiosHeaders {
  return (
    !!h &&
    typeof h === 'object' &&
    'set' in (h as Record<string, unknown>) &&
    typeof (h as AxiosHeaders).set === 'function'
  );
}

@Injectable()
export class TpstreamsClient {
  private readonly logger = new Logger(TpstreamsClient.name);

  private readonly baseUrl: string;
  private readonly orgId: string;
  private readonly username: string;
  private readonly password: string;

  private readonly http: AxiosInstance;
  private token: TokenState = {
    token: null,
    expiresAt: null,
    loginInFlight: null,
  };

  private readonly timeoutMs = TPSTREAMS_DEFAULTS.TIMEOUT_MS;
  private readonly loginMaxRetries = TPSTREAMS_DEFAULTS.LOGIN_MAX_RETRIES;
  private readonly loginBaseDelayMs = TPSTREAMS_DEFAULTS.LOGIN_BASE_DELAY_MS;
  private readonly tokenSkewMs = TPSTREAMS_DEFAULTS.TOKEN_SAFETY_SKEW_MS;

  private isLoggingIn = false;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = (
      this.config.get<string>('TPSTREAMS_BASE_URL') || ''
    ).replace(/\/+$/, '');
    this.orgId = this.config.get<string>('TPSTREAMS_ORG_ID') || '';
    this.username = this.config.get<string>('TPSTREAMS_USERNAME') || '';
    this.password = this.config.get<string>('TPSTREAMS_PASSWORD') || '';

    if (!this.baseUrl || !this.orgId || !this.username || !this.password) {
      throw new TpstreamsError(
        'TPStreams configuration is missing required values',
        400,
        TpstreamsErrorCode.CONFIG_INVALID,
      );
    }

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeoutMs,
    });

    // Request: inject Authorization
    this.http.interceptors.request.use(
      async (cfg) => {
        await this.ensureToken();
        if (this.token.token) {
          cfg = this.withAuthHeader(cfg, this.token.token);
        }
        return cfg;
      },
      (err) =>
        Promise.reject(
          err instanceof Error ? err : new Error('Request interceptor error'),
        ),
    );

    // Response: on 401, re-login once then retry
    this.http.interceptors.response.use(
      (res) => res,
      async (error) => {
        const axiosErr = error as AxiosError;
        const status = axiosErr.response?.status;
        const original = axiosErr.config as RetryableConfig | undefined;

        if (status === 401 && original && !original._retry) {
          original._retry = true;
          await this.login(true);
          return this.http.request(original);
        }

        return Promise.reject(
          axiosErr instanceof Error
            ? axiosErr
            : new Error('Unknown axios error'),
        );
      },
    );
  }

  /** Public: create a folder under the org. */
  async createFolder(
    req: TpstreamsCreateFolderRequest,
  ): Promise<TpstreamsCreateFolderResponse> {
    if (!req || typeof req.title !== 'string' || !req.title.trim()) {
      throw new TpstreamsError(
        'Invalid createFolder input: title is required',
        400,
        TpstreamsErrorCode.VALIDATION_FAILED,
      );
    }

    try {
      const url = TPSTREAMS_PATHS.FOLDERS(this.orgId);
      const payload: Record<string, unknown> = { title: req.title.trim() };
      if (typeof req.parent === 'string' && req.parent)
        payload.parent = req.parent;

      const resp = await this.http.post<TpstreamsCreateFolderResponse>(
        url,
        payload,
      );
      const data = resp.data;

      if (!this.isFolderResp(data)) {
        throw new TpstreamsError(
          'Unexpected TPStreams folder response',
          502,
          TpstreamsErrorCode.VALIDATION_FAILED,
        );
      }

      this.logger.log(`TPStreams folder created: uuid=${data.uuid}`);
      return data;
    } catch (err: unknown) {
      const te = this.mapError(
        'Failed to create TPStreams folder',
        err,
        TpstreamsErrorCode.FOLDER_CREATE_FAILED,
      );
      this.safeErrorLog(te);
      throw te;
    }
  }

  // ===== Internals =====

  private async ensureToken(): Promise<void> {
    const now = Date.now();
    const isExpired =
      !this.token.token ||
      (this.token.expiresAt !== null && now >= this.token.expiresAt);

    if (!isExpired) return;
    await this.login(false);
  }

  private async login(force: boolean): Promise<void> {
    if (this.token.loginInFlight && !force) {
      await this.token.loginInFlight;
      return;
    }

    if (force) {
      while (this.isLoggingIn) {
        await this.sleep(25);
      }
      this.isLoggingIn = true;
    }

    const doLogin = async () => {
      let attempt = 0;

      while (true) {
        attempt++;
        try {
          const resp = await axios.post<TpstreamsLoginResponse>(
            `${this.baseUrl}${TPSTREAMS_PATHS.AUTH_LOGIN}`,
            {
              username: this.username,
              password: this.password,
              organization_id: this.orgId, // ✅ required by TPStreams
            },
            { timeout: this.timeoutMs },
          );
          const data = resp.data;

          if (!this.isLoginResp(data)) {
            throw new TpstreamsError(
              'TPStreams login response invalid',
              502,
              TpstreamsErrorCode.VALIDATION_FAILED,
            );
          }

          // TPStreams returns { token: string, expiry: null }
          const accessToken = data.token as string;

          // No concrete expiry returned → pick a safe default TTL
          const expiresInSec =
            typeof (data as { expires_in?: unknown }).expires_in === 'number' &&
            Number.isFinite((data as { expires_in?: number }).expires_in)
              ? (data as { expires_in: number }).expires_in
              : 55 * 60;

          this.token = {
            token: accessToken,
            expiresAt: Date.now() + expiresInSec * 1000 - this.tokenSkewMs,
            loginInFlight: null,
          };
          this.logger.log('TPStreams login successful');
          this.logger.log(
            `TPStreams token sample: ${accessToken.slice(0, 12)}...`,
          );
          return;
        } catch (err: unknown) {
          if (attempt >= this.loginMaxRetries) {
            const te = this.mapError(
              'TPStreams login failed',
              err,
              TpstreamsErrorCode.LOGIN_FAILED,
            );
            this.safeErrorLog(te);
            this.token = { token: null, expiresAt: null, loginInFlight: null };
            throw te;
          }
          const delay = this.backoffWithJitter(this.loginBaseDelayMs, attempt);

          await this.sleep(delay);
        }
      }
    };

    const p = doLogin();
    if (!force) {
      this.token.loginInFlight = p;
    }

    try {
      await p;
    } finally {
      if (!force) this.token.loginInFlight = null;
      this.isLoggingIn = false;
    }
  }

  /** Attach Authorization using TPStreams scheme: "Token <token>" */
  private withAuthHeader(
    cfg: InternalAxiosRequestConfig,
    token: string,
  ): InternalAxiosRequestConfig {
    const h = cfg.headers;

    if (isAxiosHeaders(h)) {
      h.set('Authorization', `Token ${token}`); // ✅ not Bearer
      return cfg;
    }

    const next = new AxiosHeaders();
    if (h && typeof h === 'object') {
      Object.entries(h).forEach(([k, v]) => {
        if (typeof v === 'string') {
          next.set(k, v);
        }
      });
    }
    next.set('Authorization', `Token ${token}`); // ✅ not Bearer
    return { ...cfg, headers: next };
  }

  private mapError(
    message: string,
    err: unknown,
    code?: TpstreamsErrorCode,
  ): TpstreamsError {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const requestId = this.extractRequestId(err.response?.headers);
      return new TpstreamsError(
        message,
        status,
        code ?? TpstreamsErrorCode.NETWORK_ERROR,
        requestId,
        undefined,
      );
    }
    let extra = '';
    if (err && typeof err === 'object' && 'message' in err) {
      const m = (err as { message?: unknown }).message;
      if (typeof m === 'string') extra = `: ${m}`;
    }
    return new TpstreamsError(`${message}${extra}`, undefined, code);
  }

  // ===== Validation helpers =====

  private isLoginResp(d: unknown): d is TpstreamsLoginResponse {
    if (!d || typeof d !== 'object') return false;
    const x = d as Record<string, unknown>;
    // TPStreams returns "token" (string). Keep others for future compatibility.
    const hasToken =
      typeof x.token === 'string' ||
      typeof x['access'] === 'string' ||
      typeof x['access_token'] === 'string';
    return !!hasToken;
  }

  private isFolderResp(d: unknown): d is TpstreamsCreateFolderResponse {
    if (!d || typeof d !== 'object') return false;
    const x = d as Record<string, unknown>;
    return typeof x.uuid === 'string' && typeof x.title === 'string';
  }

  // ===== Utils =====

  private sleep(ms: number) {
    return new Promise<void>((res) => {
      setTimeout(res, ms);
    });
  }

  private backoffWithJitter(base: number, attempt: number) {
    const raw = base * Math.pow(2, attempt - 1);
    const jitter = raw * (Math.random() * 0.4 - 0.2); // ±20%
    const out = Math.floor(raw + jitter);
    return out > 50 ? out : 50;
  }

  private extractRequestId(headers: unknown): string | undefined {
    if (!headers || typeof headers !== 'object') return undefined;
    const h = headers as Record<string, unknown>;
    const a = h['x-request-id'];
    const b = h['x-correlation-id'];
    return typeof a === 'string' ? a : typeof b === 'string' ? b : undefined;
  }

  private safeErrorLog(err: TpstreamsError) {
    const code = err.code ?? 'NA';
    const status = err.status ?? 'NA';
    const requestId = err.requestId ?? 'NA';
    this.logger.error(
      `TPStreams error code=${code} status=${status} requestId=${requestId}`,
    );
  }

  async createAsset(
    payload: TpstreamsCreateAssetRequest,
  ): Promise<TpstreamsCreateAssetResponse> {
    try {
      const res = await this.http.post<TpstreamsCreateAssetResponse>(
        '/v1/assets',
        payload,
      );

      return res.data;
    } catch (err: unknown) {
      const te = this.mapError(
        'Failed to create TPStreams asset',
        err,
        TpstreamsErrorCode.VALIDATION_FAILED,
      );
      this.safeErrorLog(te);
      throw te;
    }
  }

  /**
   * Public: returns a valid TPStreams auth token (cached + reused).
   * This aligns with TPStreams best practices (avoid generating too many tokens).
   */
  async getAuthToken(): Promise<{ token: string; orgId: string }> {
    await this.ensureToken();

    if (!this.token.token) {
      throw new TpstreamsError(
        'TPStreams auth token unavailable after login',
        502,
        TpstreamsErrorCode.LOGIN_FAILED,
      );
    }

    return {
      token: this.token.token,
      orgId: this.orgId,
    };
  }
}

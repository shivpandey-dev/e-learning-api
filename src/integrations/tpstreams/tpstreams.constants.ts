export const TPSTREAMS_PATHS = {
  AUTH_LOGIN: '/api/auth/login/',
  FOLDERS: (orgId: string) => `/api/v1/${orgId}/assets/folders/`,
} as const;

export const TPSTREAMS_DEFAULTS = {
  TIMEOUT_MS: 10_000,
  LOGIN_MAX_RETRIES: 3,
  LOGIN_BASE_DELAY_MS: 300, // backoff base
  TOKEN_SAFETY_SKEW_MS: 60_000, // renew 1m early
} as const;

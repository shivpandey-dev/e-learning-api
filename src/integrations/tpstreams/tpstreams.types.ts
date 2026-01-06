export interface TpstreamsLoginResponse {
  access?: string;
  access_token?: string;
  token?: string;
  refresh?: string;
  expires_in?: number;
}

export interface TpstreamsCreateFolderRequest {
  title: string;
  parent?: string | null;
}

export interface TpstreamsCreateFolderResponse {
  uuid: string;
  title: string;
}

export interface TpstreamsCreateAssetRequest {
  title: string;
  description?: string;
  folderId?: string;
  metadata?: Record<string, any>;
}

export interface TpstreamsCreateAssetResponse {
  id: string; // assetId
  uploadUrl: string; // signed upload URL
  uploadHeaders: Record<string, string>;
  playbackUrl?: string;
  status: string; // pending, processing, ready, etc.
}

export enum TpstreamsErrorCode {
  CONFIG_INVALID = 'CONFIG_INVALID',
  LOGIN_FAILED = 'LOGIN_FAILED',
  FOLDER_CREATE_FAILED = 'FOLDER_CREATE_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export class TpstreamsError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: TpstreamsErrorCode,
    public readonly requestId?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
  }
}

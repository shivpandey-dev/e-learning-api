import { Injectable } from '@nestjs/common';
import { TpstreamsClient } from './tpstreams.client';
import {
  TpstreamsCreateFolderResponse,
  TpstreamsCreateAssetRequest,
} from './tpstreams.types';

@Injectable()
export class TpstreamsService {
  constructor(private readonly client: TpstreamsClient) {}

  /**
   * Create a course folder on TPStreams.
   * @param title Human-readable course name (e.g., "JS Basic")
   * @param parent Optional parent folder UUID
   */
  async createFolderForCourse(
    title: string,
    parent?: string,
  ): Promise<TpstreamsCreateFolderResponse> {
    return this.client.createFolder({ title, parent });
  }

  async createVideoAsset(params: TpstreamsCreateAssetRequest) {
    return this.client.createAsset(params);
  }

  async getAuthTokenForUploader(): Promise<{ token: string; orgId: string }> {
    return this.client.getAuthToken();
  }
}

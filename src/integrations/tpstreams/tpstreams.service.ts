import { Injectable } from '@nestjs/common';
import { TpstreamsClient } from './tpstreams.client';
import { TpstreamsCreateFolderResponse } from './tpstreams.types';

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
}

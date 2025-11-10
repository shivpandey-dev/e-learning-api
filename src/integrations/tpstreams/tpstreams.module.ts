import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TpstreamsClient } from './tpstreams.client';
import { TpstreamsService } from './tpstreams.service';

@Module({
  imports: [ConfigModule],
  providers: [TpstreamsClient, TpstreamsService],
  exports: [TpstreamsService],
})
export class TpstreamsModule {}

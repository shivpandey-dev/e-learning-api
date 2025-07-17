import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { LocationModule } from 'src/location/location.module';

@Module({
  imports: [TypeOrmModule.forFeature([Branch]), LocationModule],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [TypeOrmModule],
})
export class BranchModule {}

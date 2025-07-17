import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchDto } from './createBranch.dto';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}

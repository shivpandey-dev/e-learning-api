import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/createBranch.dto';
import { PaginatedBranchQueryDto } from './dto/paginatedBranchQuery.dto';
import { Request } from 'express';
import { UpdateBranchDto } from './dto/updateBranch.dto';

@Auth('admin')
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginatedBranchQueryDto, @Req() req: Request) {
    const route = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const queryParams = req.query;
    return this.branchService.findAll(query, route, queryParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Request } from 'express';
import { PaginatedUserQueryDto } from './dto/paginatedUserQuery.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Auth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Auth('admin')
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
  @Auth('teacher', 'admin')
  @Get()
  async findAll(@Query() query: PaginatedUserQueryDto, @Req() req: Request) {
    const route = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const queryParams = req.query;
    return this.usersService.findAllWithPagination(query, route, queryParams);
  }

  @Get('me')
  getMe(@Req() req: Request) {
    return this.usersService.findOne(req.user.userId);
  }

  @Auth('admin', 'teacher')
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Auth('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Auth('admin')
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { paginate } from 'src/common/utils/paginate';
import { City } from 'src/location/entities/city.entity';
import { PaginatedUserQueryDto } from './dto/paginatedUserQuery.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :identifier', { identifier })
      .orWhere('user.phone = :identifier', { identifier })
      .getOne();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashPassword,
    });
    if (createUserDto.cityId) {
      const city = await this.cityRepository.findOneOrFail({
        where: { id: createUserDto.cityId },
      });
      user.city = city;
    }
    return this.userRepository.save(user);
  }

  async findAllWithPagination(
    query: PaginatedUserQueryDto,
    route: string,
    queryParams: Record<string, any>,
  ) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.city', 'city')
      .leftJoinAndSelect('city.state', 'state')
      .leftJoinAndSelect('state.country', 'country');

    const filters: Record<string, string> = {};
    if (query.role) filters.role = query.role;
    if (query.branchId) filters.branchId = query.branchId;

    return paginate(qb, {
      page: parseInt(query.page || '1'),
      limit: parseInt(query.limit || '10'),
      searchTerm: query.search,
      searchableColumns: ['fName', 'lName', 'email'],
      filters,
      sortBy: query.sortBy,
      order: query.order,
      route,
      queryParams: queryParams as Record<string, string | string[]>,
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        city: {
          state: {
            country: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.cityId) {
      const city = await this.cityRepository.findOneOrFail({
        where: { id: updateUserDto.cityId },
      });
      user.city = city;
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.remove(user);
  }
}

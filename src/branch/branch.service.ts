import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { City } from 'src/location/entities/city.entity';
import { paginate } from 'src/common/utils/paginate';
import { CreateBranchDto } from './dto/createBranch.dto';
import { PaginatedBranchQueryDto } from './dto/paginatedBranchQuery.dto';
import { UpdateBranchDto } from './dto/updateBranch.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    @InjectRepository(City) private cityRepo: Repository<City>,
  ) {}

  async create(dto: CreateBranchDto) {
    const branch = this.branchRepo.create(dto);

    if (dto.cityId) {
      branch.city = await this.cityRepo.findOneOrFail({
        where: { id: dto.cityId },
      });
    }

    return this.branchRepo.save(branch);
  }

  async findAll(
    query: PaginatedBranchQueryDto,
    route: string,
    queryParams: any,
  ) {
    const qb = this.branchRepo
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.city', 'city')
      .leftJoinAndSelect('city.state', 'state')
      .leftJoinAndSelect('state.country', 'country');

    const filters: Record<string, string> = {};
    if (query.code) filters.code = query.code;
    if (query.cityId) filters.cityId = query.cityId;

    return paginate(qb, {
      page: parseInt(query.page || '1'),
      limit: parseInt(query.limit || '10'),
      searchTerm: query.search,
      searchableColumns: ['name', 'code'],
      filters,
      sortBy: query.sortBy,
      order: query.order,
      route,
      queryParams: queryParams as Record<string, string | string[]>,
    });
  }

  async findOne(id: string) {
    const branch = await this.branchRepo.findOne({
      where: { id },
      relations: ['city', 'city.state', 'city.state.country'],
    });

    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto) {
    const branch = await this.branchRepo.findOneOrFail({ where: { id } });

    Object.assign(branch, dto);

    if (dto.cityId) {
      branch.city = await this.cityRepo.findOneOrFail({
        where: { id: dto.cityId },
      });
    }

    return this.branchRepo.save(branch);
  }

  async remove(id: string) {
    const branch = await this.branchRepo.findOneBy({ id });
    if (!branch) throw new NotFoundException('Branch not found');

    return this.branchRepo.remove(branch);
  }
}

import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { TestingModule } from '@nestjs/testing';

export const createMockRepository = <
  T extends ObjectLiteral = ObjectLiteral,
>(): jest.Mocked<Repository<T>> => {
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
      select: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
    })),
    manager: {
      transaction: jest.fn(),
    },
    metadata: {
      columns: [],
      relations: [],
    },
  };

  return mockRepository as unknown as jest.Mocked<Repository<T>>;
};

export const createMockJwtService = (): jest.Mocked<JwtService> => {
  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  };

  return mockJwtService as unknown as jest.Mocked<JwtService>;
};

// Helper to get mocked repository from testing module
export const getMockRepository = <T extends ObjectLiteral = ObjectLiteral>(
  module: TestingModule,
  entity: new () => T,
): jest.Mocked<Repository<T>> => {
  return module.get<Repository<T>>(getRepositoryToken(entity)) as jest.Mocked<
    Repository<T>
  >;
};

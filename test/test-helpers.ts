import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { UserRole } from '../src/common/enums/UserRole.enum';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

export const createMockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
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
  })),
});

export const createMockJwtService = () => ({
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
  sign: jest.fn(),
  verify: jest.fn(),
});

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  fName: 'John',
  lName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  password: 'hashedPassword',
  role: UserRole.Student,
  branchId: 'branch-123',
  city: undefined,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const getRepositoryMock = (
  module: TestingModule,
  entity: any,
): jest.Mocked<Repository<any>> => {
  return module.get(getRepositoryToken(entity));
};

// Test data factories
export const createSignUpDto = (overrides?: any) => ({
  fName: 'John',
  lName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  password: 'password123',
  ...overrides,
});

export const createSignInDto = (overrides?: any) => ({
  identifier: 'john.doe@example.com',
  password: 'password123',
  ...overrides,
});

export const createAuthResponse = (overrides?: any) => ({
  accessToken: 'jwt.access.token',
  user: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fName: 'John',
    lName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    role: UserRole.Student,
  },
  ...overrides,
});

export const createUserResponse = (overrides?: any) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  fName: 'John',
  lName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  role: UserRole.Student,
  ...overrides,
});

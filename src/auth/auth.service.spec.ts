import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/UserRole.enum';
import { SignUpUserDto } from './dto/signUpUser.dto';
import { SignInUserDto } from './dto/signInUser.dto';

/* eslint-disable @typescript-eslint/unbound-method */

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
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
  };

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const signUpDto: SignUpUserDto = {
        fName: 'John',
        lName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const savedUser = { ...mockUser, ...signUpDto, password: hashedPassword };
      userRepository.create.mockReturnValue(savedUser);
      userRepository.save.mockResolvedValue(savedUser);

      // Act
      const result = await service.signUp(signUpDto);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...signUpDto,
          password: hashedPassword,
        }),
      );
      expect(userRepository.save).toHaveBeenCalledWith(savedUser);
      expect(result).toEqual({
        id: savedUser.id,
        fName: savedUser.fName,
        lName: savedUser.lName,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
      });
    });
  });

  describe('signIn', () => {
    it('should sign in user with email successfully', async () => {
      // Arrange
      const signInDto: SignInUserDto = {
        identifier: 'john.doe@example.com',
        password: 'password123',
      };

      const accessToken = 'jwt.access.token';

      userRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.signAsync.mockResolvedValue(accessToken);

      // Act
      const result = await service.signIn(signInDto);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: signInDto.identifier },
          { phone: signInDto.identifier },
        ],
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        userId: mockUser.id,
        role: mockUser.role,
      });
      expect(result).toEqual({
        accessToken,
        user: {
          id: mockUser.id,
          fName: mockUser.fName,
          lName: mockUser.lName,
          email: mockUser.email,
          phone: mockUser.phone,
          role: mockUser.role,
        },
      });
    });

    it('should sign in user with phone successfully', async () => {
      // Arrange
      const signInDto: SignInUserDto = {
        identifier: '+1234567890',
        password: 'password123',
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.signAsync.mockResolvedValue('jwt.access.token');

      // Act
      const result = await service.signIn(signInDto);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: signInDto.identifier },
          { phone: signInDto.identifier },
        ],
      });
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const signInDto: SignInUserDto = {
        identifier: 'nonexistent@example.com',
        password: 'password123',
      };

      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.signIn(signInDto)).rejects.toThrow(
        'Invalid Credential',
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const signInDto: SignInUserDto = {
        identifier: 'john.doe@example.com',
        password: 'wrongpassword',
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.signIn(signInDto)).rejects.toThrow(
        'Invalid Credential',
      );
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../src/auth/auth.module';
import { User } from '../src/users/user.entity';
import { UserRole } from '../src/common/enums/UserRole.enum';
import * as bcrypt from 'bcrypt';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fName: 'John',
    lName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    password: 'hashedPassword',
    role: UserRole.Student,
    branchId: 'branch-123',
    city: undefined,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

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

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/sign-up (POST)', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const signUpDto = {
        fName: 'John',
        lName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'password123',
      };

      const expectedResponse = {
        id: mockUser.id,
        fName: mockUser.fName,
        lName: mockUser.lName,
        email: mockUser.email,
        phone: mockUser.phone,
        role: mockUser.role,
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Mock bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should return validation error for invalid email', async () => {
      // Arrange
      const invalidSignUpDto = {
        fName: 'John',
        lName: 'Doe',
        email: 'invalid-email',
        phone: '1234567890',
        password: 'password123',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(invalidSignUpDto)
        .expect(400);

      expect(response.body.message).toContain('email must be an email');
    });

    it('should return validation error for short password', async () => {
      // Arrange
      const invalidSignUpDto = {
        fName: 'John',
        lName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: '123',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(invalidSignUpDto)
        .expect(400);

      expect(response.body.message).toContain(
        'password must be longer than or equal to 6 characters',
      );
    });

    it('should return validation error for invalid phone number', async () => {
      // Arrange
      const invalidSignUpDto = {
        fName: 'John',
        lName: 'Doe',
        email: 'john.doe@example.com',
        phone: 'invalid-phone',
        password: 'password123',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(invalidSignUpDto)
        .expect(400);

      expect(response.body.message).toContain('phone must be a phone number');
    });
  });

  describe('/auth/sign-in (POST)', () => {
    it('should sign in user with valid email credentials', async () => {
      // Arrange
      const signInDto = {
        identifier: 'john.doe@example.com',
        password: 'password123',
      };

      const accessToken = 'jwt.access.token';
      const expectedResponse = {
        accessToken,
        user: {
          id: mockUser.id,
          fName: mockUser.fName,
          lName: mockUser.lName,
          email: mockUser.email,
          phone: mockUser.phone,
          role: mockUser.role,
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(accessToken);

      // Mock bcrypt.compare
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(signInDto)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: signInDto.identifier },
          { phone: signInDto.identifier },
        ],
      });
    });

    it('should sign in user with valid phone credentials', async () => {
      // Arrange
      const signInDto = {
        identifier: '1234567890',
        password: 'password123',
      };

      const accessToken = 'jwt.access.token';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(accessToken);

      // Mock bcrypt.compare
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(signInDto)
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should return 401 for non-existent user', async () => {
      // Arrange
      const signInDto = {
        identifier: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(signInDto)
        .expect(401);

      expect(response.body.message).toBe('Invalid Credential');
    });

    it('should return 401 for incorrect password', async () => {
      // Arrange
      const signInDto = {
        identifier: 'john.doe@example.com',
        password: 'wrongpassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Mock bcrypt.compare to return false
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(signInDto)
        .expect(401);

      expect(response.body.message).toBe('Invalid Credential');
    });

    it('should return validation error for missing identifier', async () => {
      // Arrange
      const invalidSignInDto = {
        password: 'password123',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(invalidSignInDto)
        .expect(400);

      expect(response.body.message).toContain('identifier must be a string');
    });

    it('should return validation error for missing password', async () => {
      // Arrange
      const invalidSignInDto = {
        identifier: 'john.doe@example.com',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(invalidSignInDto)
        .expect(400);

      expect(response.body.message).toContain('password must be a string');
    });
  });
});

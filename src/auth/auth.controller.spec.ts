import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signUpUser.dto';
import { SignInUserDto } from './dto/signInUser.dto';
import { UserRole } from '../common/enums/UserRole.enum';
import { UnauthorizedException } from '@nestjs/common';

/* eslint-disable @typescript-eslint/unbound-method */

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

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

      const expectedResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fName: 'John',
        lName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        role: UserRole.Student,
      };

      authService.signUp.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signUp(signUpDto);

      // Assert
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(authService.signUp).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when service throws error', async () => {
      // Arrange
      const signUpDto: SignUpUserDto = {
        fName: 'John',
        lName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        password: 'password123',
      };

      authService.signUp.mockRejectedValue(new Error('Email already exists'));

      // Act & Assert
      await expect(controller.signUp(signUpDto)).rejects.toThrow(
        'Email already exists',
      );
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      // Arrange
      const signInDto: SignInUserDto = {
        identifier: 'john.doe@example.com',
        password: 'password123',
      };

      const expectedResult = {
        accessToken: 'jwt.access.token',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          fName: 'John',
          lName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          role: UserRole.Student,
        },
      };

      authService.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signIn(signInDto);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      expect(authService.signIn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Arrange
      const signInDto: SignInUserDto = {
        identifier: 'john.doe@example.com',
        password: 'wrongpassword',
      };

      authService.signIn.mockRejectedValue(
        new UnauthorizedException('Invalid Credential'),
      );

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        'Invalid Credential',
      );
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should sign in user with phone number', async () => {
      // Arrange
      const signInDto: SignInUserDto = {
        identifier: '+1234567890',
        password: 'password123',
      };

      const expectedResult = {
        accessToken: 'jwt.access.token',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          fName: 'John',
          lName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          role: UserRole.Student,
        },
      };

      authService.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signIn(signInDto);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      expect(result).toEqual(expectedResult);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

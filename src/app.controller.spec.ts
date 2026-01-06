import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService, HelloResponse } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  // Typed mock without jest.Mocked<...> to avoid unbound-method warning
  const mockAppService: Pick<AppService, 'getHello'> = {
    getHello: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    // Strongly typed, no `any` → no no-unsafe-assignment
    appController = moduleRef.get<AppController>(AppController);

    jest.clearAllMocks();
  });

  describe('home', () => {
    it('should return welcome object from AppService', () => {
      const expectedResponse: HelloResponse = {
        message: 'Welcome to the E-Learning Platform API! - DEVELOPMENT Server',
        status: 'OK',
        version: 'v1.0',
        docs: '/api-docs',
      };

      // Narrow mock type so ESLint is happy
      (mockAppService.getHello as jest.Mock<HelloResponse>).mockReturnValue(
        expectedResponse,
      );

      const result = appController.home();

      expect(mockAppService.getHello).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });
  });
});

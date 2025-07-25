import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: jest.Mocked<AppService>;

  const mockAppService = {
    getHello: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get(AppService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('home', () => {
    it('should return "Hello World!"', () => {
      // Arrange
      const expectedMessage = 'Hello World!';
      appService.getHello.mockReturnValue(expectedMessage);

      // Act
      const result = appController.home();

      // Assert
      expect(mockAppService.getHello).toHaveBeenCalled();
      expect(result).toBe(expectedMessage);
    });
  });
});

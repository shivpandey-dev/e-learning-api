# Testing Guide for E-Learning API

## 🎯 Testing Strategy

### 📊 Test Types

1. **Unit Tests** (`*.spec.ts` in src/)

   - Test individual classes/methods in isolation
   - Mock all dependencies
   - Fast execution
   - High code coverage

2. **Integration Tests** (specific test scenarios)

   - Test multiple components working together
   - Use real database connections
   - Test data flow between layers

3. **E2E Tests** (`*.e2e-spec.ts` in test/)
   - Test complete HTTP request/response cycles
   - Test from client perspective
   - Use test database
   - Slower but most comprehensive

## 🚀 Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only E2E tests
npm run test:e2e

# Run specific module tests
npm run test:auth
npm run test:users
npm run test:branch
```

## 📝 Writing Unit Tests

### Basic Service Test Structure

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YourService } from './your.service';
import { YourEntity } from './your.entity';

describe('YourService', () => {
  let service: YourService;
  let repository: jest.Mocked<Repository<YourEntity>>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: getRepositoryToken(YourEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    repository = module.get(getRepositoryToken(YourEntity));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create entity successfully', async () => {
      // Arrange
      const createDto = { name: 'Test' };
      const savedEntity = { id: '1', ...createDto };

      repository.create.mockReturnValue(savedEntity as any);
      repository.save.mockResolvedValue(savedEntity as any);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(savedEntity);
      expect(result).toEqual(savedEntity);
    });
  });
});
```

### Basic Controller Test Structure

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourController } from './your.controller';
import { YourService } from './your.service';

describe('YourController', () => {
  let controller: YourController;
  let service: jest.Mocked<YourService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YourController],
      providers: [
        {
          provide: YourService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<YourController>(YourController);
    service = module.get(YourService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create entity successfully', async () => {
      // Arrange
      const createDto = { name: 'Test' };
      const expectedResult = { id: '1', ...createDto };

      service.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
```

## 🔧 Writing E2E Tests

### Basic E2E Test Structure

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('YourController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/your-endpoint (POST)', async () => {
    const createDto = { name: 'Test' };

    const response = await request(app.getHttpServer())
      .post('/your-endpoint')
      .send(createDto)
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Test',
      id: expect.any(String),
    });
  });
});
```

## ✅ Testing Best Practices

### 1. **AAA Pattern**

```typescript
it('should do something', () => {
  // Arrange - Set up test data and mocks
  const input = { name: 'test' };
  service.method.mockResolvedValue(expectedOutput);

  // Act - Call the method being tested
  const result = await controller.method(input);

  // Assert - Verify the results
  expect(service.method).toHaveBeenCalledWith(input);
  expect(result).toEqual(expectedOutput);
});
```

### 2. **Descriptive Test Names**

```typescript
// ❌ Bad
it('should work', () => {});

// ✅ Good
it('should return user data when valid ID is provided', () => {});
it('should throw NotFoundException when user does not exist', () => {});
```

### 3. **Test Edge Cases**

```typescript
describe('UserService', () => {
  // Happy path
  it('should create user successfully with valid data', () => {});

  // Error cases
  it('should throw BadRequestException when email already exists', () => {});
  it('should throw ValidationException when password is too short', () => {});

  // Edge cases
  it('should handle empty string inputs gracefully', () => {});
  it('should handle null values correctly', () => {});
});
```

### 4. **Mock External Dependencies**

```typescript
// Mock external services
jest.mock('bcrypt');
jest.mock('nodemailer');

// Mock repositories
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};
```

## 📊 Test Coverage Guidelines

- **Aim for 80%+ code coverage**
- **100% coverage for critical business logic**
- **Focus on testing behavior, not implementation**

```bash
# Generate coverage report
npm run test:cov

# Coverage will be generated in ./coverage/
# Open coverage/lcov-report/index.html in browser
```

## 🐛 Common Testing Issues & Solutions

### Issue 1: Module Resolution Errors

```typescript
// ❌ Error: Cannot find module 'src/...'
import { User } from 'src/users/user.entity';

// ✅ Solution: Use relative paths in tests
import { User } from '../users/user.entity';
```

### Issue 2: Dependency Injection Errors

```typescript
// ❌ Error: Nest can't resolve dependencies
TestingModule.forRoot({
  providers: [UserService],
});

// ✅ Solution: Mock all dependencies
TestingModule.forRoot({
  providers: [
    UserService,
    {
      provide: getRepositoryToken(User),
      useValue: mockRepository,
    },
  ],
});
```

### Issue 3: Async Test Issues

```typescript
// ❌ Missing await
it('should create user', () => {
  const result = service.create(dto); // Missing await
  expect(result).toBeDefined();
});

// ✅ Proper async handling
it('should create user', async () => {
  const result = await service.create(dto);
  expect(result).toBeDefined();
});
```

## 🔄 Continuous Integration

Add to your CI/CD pipeline:

```yml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:cov
      - run: npm run test:e2e
```

## 📈 Test Metrics to Track

1. **Code Coverage** - Percentage of code tested
2. **Test Execution Time** - Keep tests fast
3. **Test Reliability** - Tests should be deterministic
4. **Test Maintainability** - Easy to update when code changes

## 🎯 Next Steps

1. ✅ **Set up basic unit tests** (Done for Auth)
2. ⏳ **Add comprehensive service tests**
3. ⏳ **Create controller tests**
4. ⏳ **Implement E2E tests**
5. ⏳ **Add integration tests**
6. ⏳ **Set up CI/CD with tests**

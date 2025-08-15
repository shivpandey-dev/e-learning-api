# 🧠 E-Learning Backend API

This is the backend API for an E-Learning platform built using **NestJS**, **TypeORM**, and **MongoDB/PostgreSQL**. It supports user authentication, branch/institute management, and scalable address normalization.

---

## 🚀 Tech Stack

- **Node.js** (Runtime Environment)
- **NestJS** (Progressive Node.js Framework)
- **TypeScript** (Type Safety)
- **TypeORM** (Database ORM)
- **MongoDB / PostgreSQL** (Database)
- **JWT Auth** (Authentication)
- **Jest** (Testing Framework)
- **AWS EC2** (Production Hosting)
- **PM2** (Process Management)

---

## 📁 Folder Structure

```
src/
├── auth/              # Authentication module with JWT
│   ├── dto/           # Data Transfer Objects
│   ├── guards/        # JWT auth guards
│   ├── strategies/    # Passport strategies
│   └── interfaces/    # TypeScript interfaces
├── users/             # User module with CRUD & pagination
├── branch/            # Institute branch module
├── location/          # Normalized location (city, state, country)
├── common/            # Shared utilities, decorators, DTOs
│   ├── decorators/    # Custom decorators
│   ├── guards/        # Authorization guards
│   ├── enums/         # TypeScript enums
│   └── utils/         # Utility functions
└── main.ts            # App entry point

test/
├── auth.e2e-spec.ts   # End-to-end tests
├── mocks/             # Test mocking utilities
└── test-helpers.ts    # Testing helper functions
```

---

## 🔐 Features

- ✅ **Authentication & Security**

  - Secure SignUp / SignIn with JWT
  - Role-based Authorization (Admin / Teacher / Student)
  - Password hashing with bcrypt
  - JWT token validation and guards

- ✅ **User Management**

  - Paginated User Listing with Filters & Sorting
  - User profile management
  - Role-based access control

- ✅ **Data Management**

  - City-State-Country Normalization for Address
  - TypeORM entity relationships
  - Data validation with class-validator

- ✅ **Development & Testing**

  - Comprehensive Unit Tests (Jest)
  - End-to-End (E2E) Testing
  - 75%+ Test Coverage
  - TypeScript strict mode compliance

- ✅ **Architecture & Deployment**
  - Modular, Scalable NestJS Structure
  - RESTful API design
  - Deployed on AWS EC2
  - Production-ready configuration

---

## ⚙️ Setup & Run Locally

### 1. Clone the Repo

```bash
git clone https://github.com/shivpandey-dev/e-learning-api.git
cd e-learning-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGO_URI=your_mongo_or_postgres_connection
JWT_SECRET=your_jwt_secret
```

### 4. Run the Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

---

## 🧪 Testing

This project includes comprehensive testing with Jest.

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run specific module tests
npm test -- --testPathPattern=auth
```

### Test Coverage

- **Unit Tests**: Individual component testing with mocking
- **E2E Tests**: Complete request/response cycle testing
- **Coverage**: 75%+ code coverage maintained
- **Quality**: TypeScript strict mode compliance

---

## 🚀 Production (on AWS EC2)

```bash
npm run build
pm2 start dist/main.js --name elearning-api
pm2 save
pm2 startup
```

---

## 📦 API Endpoints

### Authentication

| Method | Endpoint        | Description            | Status    |
| ------ | --------------- | ---------------------- | --------- |
| POST   | `/auth/sign-up` | Register new user      | ✅ Tested |
| POST   | `/auth/sign-in` | Login with email/phone | ✅ Tested |

### Users

| Method | Endpoint    | Description              | Status         |
| ------ | ----------- | ------------------------ | -------------- |
| GET    | `/users`    | Get users (paginated)    | 🚧 In Progress |
| GET    | `/users/me` | Get current user profile | 🚧 In Progress |
| POST   | `/users`    | Create new user (Admin)  | 🚧 In Progress |

### Branches

| Method | Endpoint  | Description      | Status         |
| ------ | --------- | ---------------- | -------------- |
| GET    | `/branch` | Get all branches | 🚧 In Progress |

➡️ More endpoints to be documented...

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Author

Built with ❤️ by **[Shiv Pandey](https://github.com/shivpandey-dev)**

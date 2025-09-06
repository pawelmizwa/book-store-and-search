# Bookstore Application

A full-stack, enterprise-scale bookstore application built with modern technologies, optimized for **10+ million book records**. Features NestJS backend with hexagonal architecture and Next.js frontend.

## 🚀 Features

### Backend (NestJS)

- ✅ **Hexagonal Architecture** for maintainable, testable code
- ✅ **Enterprise Security** with input validation, rate limiting, and signed cursors
- ✅ **Cursor-based Pagination** supporting millions of records
- ✅ **Advanced Search** with full-text search and multiple filters
- ✅ **PostgreSQL** with optimized indexes for fast queries
- ✅ **Swagger Documentation** for comprehensive API docs
- ✅ **TDD Approach** with Vitest testing framework
- ✅ **Docker Support** for easy deployment

### Frontend (Next.js)

- ✅ **Modern React** with TypeScript and Next.js 15
- ✅ **Responsive Design** with Tailwind CSS and Radix UI
- ✅ **React Query** for efficient data management and caching
- ✅ **Form Validation** with React Hook Form and Zod
- ✅ **Accessibility** compliant with WCAG guidelines
- ✅ **Real-time Search** with debounced input and filters

### Database & Security

- ✅ **Enterprise-Scale Optimization** for 10+ million records
- ✅ **Dual Primary Key Strategy** - Sequential ID + UUID
- ✅ **Advanced Indexing** - Trigram, GIN, composite, and partial indexes
- ✅ **Enterprise Security** - Input validation, rate limiting, signed cursors
- ✅ **Zero-Downtime Migrations** with backward compatibility

## 🏗️ Architecture

### System Overview

```mermaid
graph TD
    A[Frontend - Next.js] --> B[API Gateway]
    B --> C[Backend - NestJS]
    C --> D[PostgreSQL Database]

    subgraph "Frontend Layer"
    A --> A1[React Query Cache]
    A --> A2[UI Components]
    A --> A3[Form Validation]
    end

    subgraph "Backend Layer"
    C --> C1[Domain Layer]
    C --> C2[Application Layer]
    C --> C3[Infrastructure Layer]
    end

    subgraph "Database Layer"
    D --> D1[Books Table]
    D --> D2[Indexes]
    D --> D3[Full-text Search]
    end
```

### Technology Stack

| Layer                | Technology                   | Purpose                                    |
| -------------------- | ---------------------------- | ------------------------------------------ |
| **Frontend**         | Next.js 15 + TypeScript      | React framework with SSR support           |
| **UI Library**       | Tailwind CSS + Radix UI      | Styling and accessible components          |
| **State Management** | React Query                  | Data fetching and caching                  |
| **Form Handling**    | React Hook Form + Zod        | Form validation and submission             |
| **Backend**          | NestJS + Fastify             | Scalable Node.js API framework             |
| **Architecture**     | Hexagonal (Ports & Adapters) | Clean, testable architecture               |
| **Database**         | PostgreSQL 15                | Relational database with advanced features |
| **Query Builder**    | Knex.js                      | SQL query builder                          |
| **Testing**          | Vitest + Jest                | Unit and integration testing               |
| **Documentation**    | Swagger/OpenAPI              | API documentation                          |
| **Containerization** | Docker + Docker Compose      | Development and deployment                 |

## 📊 Performance & Security

### Core Features
- **Database Records**: Production-tested with 10+ million records
- **Search Performance**: Fast partial text matching and full-text search
- **Pagination**: O(1) performance with signed cursor-based pagination
- **Security**: Comprehensive input validation, rate limiting, and attack prevention
- **Concurrent Users**: Handles thousands of concurrent requests

### Database Architecture
- **Dual Primary Key**: BIGINT sequential + UUID for performance and compatibility
- **Specialized Indexes**: Trigram, covering, and partial indexes for optimal queries
- **Materialized Full-Text Search**: Pre-computed search vectors with auto-maintenance
- **Secure Queries**: Parameterized queries prevent injection attacks

## 🛠️ Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose
- pnpm 9.15+

### Development Setup

#### 🐳 Quick Start with Docker (Recommended)

1. **Prerequisites**:
   - Docker & Docker Compose
   - Git

2. **Clone and start**:
   ```bash
   git clone <repository-url>
   cd book-store-and-search
   
   # Start all services with Docker
   docker compose up -d
   
   # Or run the test script
   bash scripts/test-docker.sh
   ```

3. **Access the application**:
   - 🌐 Frontend: http://localhost:3000
   - 🔧 Backend API: http://localhost:8080
   - 📚 API Documentation: http://localhost:8080/docs
   - 🗄️ Database: localhost:5432 (user: bookstore, password: bookstore_password)

#### 🔧 Manual Setup (Advanced)

1. **Prerequisites**:
   - Node.js 20+, PostgreSQL 15+, pnpm 9.15+

2. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd book-store-and-search
   pnpm run setup
   ```

3. **Start development servers**:
   ```bash
   # Option A: Local development with Docker database
   pnpm run docker:db:up  # Start PostgreSQL
   pnpm run db:migrate    # Run database migrations
   pnpm run dev           # Start backend & frontend
   
   # Option B: Docker development environment
   pnpm run docker:dev
   ```

#### Manual Setup (Advanced)

If you prefer manual setup or need to troubleshoot:

1. **Prerequisites**:
   ```bash
   # Install workspace dependencies
   pnpm install
   
   # Build shared package (required for backend)
   pnpm run build:shared
   ```

2. **Environment Configuration**:
   ```bash
   # Backend configuration
   cd backend
   cp .env.example .env  # Edit with your settings
   
   # Frontend configuration  
   cd ../frontend
   cp .env.example .env.local  # Edit with your settings
   ```

3. **Database Setup**:
   ```bash
   # Start PostgreSQL with Docker
   pnpm run docker:db:up
   
   # Run migrations
   pnpm run db:migrate
   ```

4. **Start Services**:
   ```bash
   # Backend (terminal 1)
   cd backend
   pnpm start:dev
   
   # Frontend (terminal 2) 
   cd frontend
   pnpm dev
   ```

#### Environment Variables

**Backend** (`.env`):
```bash
# Required
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://bookstore_user:bookstore_password@localhost:5432/bookstore

# Optional
LOG_LEVEL=info
DATABASE_POOL_SIZE=10
IAM_JWKS_URI=https://your-auth-provider.com/.well-known/jwks.json
```

**Frontend** (`.env.local`):
```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional
NEXT_PUBLIC_ENVIRONMENT=local
NEXT_PUBLIC_APP_NAME=Book Store
```

#### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run setup` | 🚀 One-time development environment setup |
| `pnpm run dev` | 🔄 Start backend & frontend in development mode |
| `pnpm run docker:dev` | 🐳 Start full Docker development environment |
| `pnpm run docker:db:up` | 🗄️ Start PostgreSQL database only |
| `pnpm run db:migrate` | 📊 Run database migrations |
| `pnpm run build` | 🔨 Build all packages for production |
| `pnpm run test` | 🧪 Run tests across all packages |
| `pnpm run lint` | 🔍 Lint code across all packages |
| `pnpm run clean` | 🧹 Clean all dependencies and build artifacts |

#### Troubleshooting

**🔧 Backend won't start:**
```bash
# Check if shared package is built
pnpm run build:shared

# Check database connection
docker compose ps postgres

# Reset backend dependencies
cd backend && rm -rf node_modules && pnpm install
```

**🌐 Frontend issues:**
```bash
# Check environment variables
cat frontend/.env.local

# Reset frontend
cd frontend && rm -rf .next node_modules && pnpm install
```

**🐳 Docker issues:**
```bash
# Rebuild containers
pnpm run docker:build

# Reset Docker environment
pnpm run docker:down
docker system prune -f
pnpm run docker:dev
```

**🗄️ Database connection errors:**
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Reset database
pnpm run docker:db:down
pnpm run docker:db:up
pnpm run db:migrate
```

### Production Deployment

```bash
# Build and start all services
docker-compose up -d

# Run migrations
docker-compose exec backend pnpm migrate
```

## 📚 API Documentation

### Core Endpoints

| Method   | Endpoint        | Description                        |
| -------- | --------------- | ---------------------------------- |
| `POST`   | `/books`        | Create a new book                  |
| `GET`    | `/books/search` | Search books with advanced filters |
| `GET`    | `/books/:id`    | Get book by ID                     |
| `PUT`    | `/books/:id`    | Update book                        |
| `DELETE` | `/books/:id`    | Delete book                        |

### Example API Usage

```bash
# Create a book
curl -X POST http://localhost:3001/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
    "pages": 180,
    "rating": 4.5
  }'

# Search with filters
curl "http://localhost:3001/books/search?search_query=gatsby&min_rating=4&sort_by=rating&sort_order=desc"

# Paginated search
curl "http://localhost:3001/books/search?limit=10&cursor=eyJjcmVhdGVkX2F0IjoiMjAyNCJ9"
```

### Search Parameters

- `title` / `author` - Fast partial text matching with trigram indexes
- `min_rating` / `max_rating` - Rating range filter (1.0-5.0)
- `search_query` - Full-text search with materialized search vectors
- `limit` - Results per page (default: 10, max: 100)
- `cursor` - Signed cursor pagination for security and performance
- `sort_by` / `sort_order` - Flexible sorting with optimized indexes

## 🧪 Testing

### Backend Testing

```bash
cd backend
pnpm test           # Run all tests
pnpm test --watch   # Watch mode
pnpm test:types     # Type checking
```

### Frontend Testing

```bash
cd frontend
pnpm test           # Run all tests
pnpm test --watch   # Watch mode
pnpm test:types     # Type checking
```

### Test Coverage

- **Backend**: Unit tests for domain logic, integration tests for APIs
- **Frontend**: Component tests, user interaction tests, accessibility tests
- **TDD Approach**: Tests written before implementation

## 📖 Documentation

### Documentation

- [API Documentation](http://localhost:3001/docs) - Interactive Swagger UI
- [Performance Guide](./PERFORMANCE.md) - Enterprise-scale optimization
- [Security Guide](./backend/SECURITY.md) - Security implementation
- [Database Schema](./backend/src/database/migration/) - Migration files

### Architecture Documentation

- **Hexagonal Architecture**: Clean separation of concerns
- **Domain-Driven Design**: Business logic in domain layer
- **SOLID Principles**: Applied throughout the codebase
- **Functional Programming**: Immutable data and pure functions

## 🔧 Development

### Code Quality

- **TypeScript**: Strict mode enabled for both frontend and backend
- **ESLint**: Consistent code style and best practices
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks for quality checks

### Database Migrations

```bash
# Create new migration
cd backend
pnpm migrate:make migration_name

# Run migrations (includes performance optimizations)
pnpm migrate

# Check migration status
pnpm knex migrate:status
```

#### Enterprise Architecture Migration

Key migration `20250905151310_optimize_books_performance` implements:
- Dual primary key strategy (BIGINT + UUID)
- Specialized indexes for optimal query performance
- Materialized full-text search with auto-update triggers
- Zero-downtime deployment with `CONCURRENTLY` index creation

### Monitoring & Debugging

- **Health Checks**: Available at `/health` endpoint
- **Prometheus Metrics**: Built-in metrics collection
- **Structured Logging**: JSON logs with Pino
- **Error Tracking**: Comprehensive error handling

## 🐳 Docker Configuration

### Quick Commands

```bash
# Start all services (production mode)
docker compose up -d

# Start with development mode (hot reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f backend frontend

# Rebuild after code changes
docker compose build

# Test complete setup
bash scripts/test-docker.sh
```

### Development Environment

- **Hot Reload**: Development mode mounts source code for instant changes
- **Database**: Persistent PostgreSQL with separate dev/prod databases
- **Networking**: Internal Docker network with proper service discovery
- **Health Checks**: Built-in health monitoring for all services

### Production Deployment

```bash
# Production deployment
docker compose up -d

# Scale backend services
docker compose up -d --scale backend=3

# Run database migrations
docker compose exec backend pnpm migrate
```

### Troubleshooting

```bash
# Check service status
docker compose ps

# View detailed logs
docker compose logs [service-name]

# Restart a service
docker compose restart [service-name]

# Clean rebuild
docker compose down && docker compose build --no-cache && docker compose up -d

# Remove everything and start fresh
docker compose down -v && docker system prune -f
```
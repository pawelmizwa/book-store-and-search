# Frontend Dockerfile
FROM node:20-alpine

# Install pnpm
RUN corepack enable pnpm

# Set working directory
WORKDIR /app

# Copy root package files for workspace setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy shared package
COPY shared/ ./shared/

# Copy frontend package files first for better layer caching
COPY frontend/package.json ./frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package first
RUN pnpm --filter=shared build

# Copy frontend source code
COPY frontend/ ./frontend/

# Build frontend
RUN pnpm --filter=frontend build

# Expose port
EXPOSE 3000

# Set working directory to frontend
WORKDIR /app/frontend

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["pnpm", "start"]

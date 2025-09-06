# Backend Dockerfile
FROM node:20-alpine

# Install pnpm
RUN corepack enable pnpm

# Set working directory
WORKDIR /app

# Copy root package files for workspace setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy shared package
COPY shared/ ./shared/

# Copy backend package files first for better layer caching
COPY backend/package.json ./backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package first
RUN pnpm --filter=shared build

# Copy backend source code
COPY backend/ ./backend/

# Set working directory to backend for build
WORKDIR /app/backend

# Build backend
RUN pnpm build

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["pnpm", "start:prod"]

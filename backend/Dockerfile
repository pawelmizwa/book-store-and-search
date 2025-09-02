ARG NODE_VERSION=20

# Base stage with common dependencies
FROM node:${NODE_VERSION}-slim as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@9 --activate

# Install curl for health checks and other utilities
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies stage
FROM base as deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Development stage
FROM base as development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# Remove any existing dist folder in development
RUN rm -rf dist
EXPOSE 3001
CMD ["pnpm", "start:dev"]

# Build stage
FROM base as build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production stage
FROM base as production
ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist

EXPOSE 3001
USER node
CMD ["pnpm", "start:prod"]

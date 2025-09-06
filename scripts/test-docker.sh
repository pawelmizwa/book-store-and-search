#!/bin/bash

# Docker Setup Test Script
# Tests the complete Docker environment for the bookstore application

set -e

echo "🐳 Testing Docker Setup for Book Store Application"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Stop any running containers
echo "🧹 Cleaning up existing containers..."
docker compose down --remove-orphans > /dev/null 2>&1 || true

# Remove old volumes to ensure clean start
echo "🗄️ Removing old database volume..."
docker volume rm book-store-and-search_postgres_data > /dev/null 2>&1 || true

# Build images
echo "🔨 Building Docker images..."
if ! docker compose build; then
    echo "❌ Failed to build Docker images"
    exit 1
fi

# Start PostgreSQL first
echo "🗄️ Starting PostgreSQL database..."
if ! docker compose up -d postgres; then
    echo "❌ Failed to start PostgreSQL"
    exit 1
fi

# Wait for PostgreSQL to be healthy
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker compose ps postgres | grep -q "healthy"; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        echo "❌ PostgreSQL failed to start within ${timeout} seconds"
        docker compose logs postgres
        exit 1
    fi
done

# Start backend
echo "🚀 Starting backend service..."
if ! docker compose up -d backend; then
    echo "❌ Failed to start backend"
    exit 1
fi

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker compose ps backend | grep -q "Up"; then
        # Check if backend is responding
        sleep 5
        if curl -f http://localhost:8080/health > /dev/null 2>&1; then
            echo "✅ Backend is ready and responding!"
            break
        fi
    fi
    
    # Check for restart loops
    if docker compose ps backend | grep -q "Restarting"; then
        echo "❌ Backend is in restart loop. Checking logs..."
        docker compose logs backend --tail 20
        exit 1
    fi
    
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        echo "❌ Backend failed to start within ${timeout} seconds"
        echo "📋 Backend logs:"
        docker compose logs backend --tail 20
        exit 1
    fi
done

# Run database migrations
echo "📊 Running database migrations..."
if ! docker compose exec backend pnpm migrate; then
    echo "⚠️ Database migrations failed (this might be normal for first run)"
fi

# Start frontend
echo "🌐 Starting frontend service..."
if ! docker compose up -d frontend; then
    echo "❌ Failed to start frontend"
    exit 1
fi

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is ready and responding!"
        break
    fi
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        echo "❌ Frontend failed to start within ${timeout} seconds"
        echo "📋 Frontend logs:"
        docker compose logs frontend --tail 20
        exit 1
    fi
done

# Test API endpoint
echo "🧪 Testing API endpoints..."
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Show running services
echo "📋 All services status:"
docker compose ps

echo ""
echo "🎉 Docker setup test completed successfully!"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo "   API Docs: http://localhost:8080/docs"
echo "   Database: localhost:5432 (user: bookstore, password: bookstore_password)"
echo ""
echo "🔧 Useful commands:"
echo "   Stop all:     docker compose down"
echo "   View logs:    docker compose logs -f [service]"
echo "   Rebuild:      docker compose build"
echo "   Shell access: docker compose exec [service] /bin/sh"

#!/bin/bash

# Simple Docker startup script
set -e

echo "🐳 Starting Book Store Application with Docker..."

# Stop any running containers
docker compose down > /dev/null 2>&1 || true

# Start all services
echo "🚀 Starting all services..."
docker compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "📋 Service status:"
docker compose ps

echo ""
echo "🎉 Application started!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo "   API Docs: http://localhost:8080/docs"

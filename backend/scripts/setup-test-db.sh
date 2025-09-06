#!/bin/bash

# Test database setup script
echo "Setting up test database..."

# Create test database if it doesn't exist
createdb bookstore_test 2>/dev/null || echo "Database bookstore_test already exists"

# Set environment variables for test
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bookstore_test
export DATABASE_POOL_SIZE=5
export ENVIRONMENT=test
export CURSOR_SECRET=test-secret-key-for-testing

# Run migrations on test database
echo "Running migrations..."
pnpm migrate

echo "Test database setup complete!"

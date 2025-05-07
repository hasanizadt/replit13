#!/bin/bash

echo "Setting up database..."

# Check if DATABASE_URL environment variable is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  exit 1
fi

# Run the seed script
echo "Running database seed script..."
npx ts-node prisma/seed-db.ts

echo "Database setup completed!"
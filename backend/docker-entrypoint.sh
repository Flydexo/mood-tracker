#!/bin/sh
set -e

echo "Running database migrations..."
node ace.js migration:run --force

echo "Starting server..."
exec "$@"

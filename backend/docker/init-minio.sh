#!/bin/sh
set -e

MC_ALIAS="${MC_ALIAS:-local}"
MC_HOST="${MC_HOST:-http://localhost:9000}"
MC_ACCESS_KEY="${MC_ACCESS_KEY:-minioadmin}"
MC_SECRET_KEY="${MC_SECRET_KEY:-minioadmin}"
BUCKET_NAME="${BUCKET_NAME:-uniform-store}"

echo "Waiting for MinIO to be ready..."
until mc alias set "$MC_ALIAS" "$MC_HOST" "$MC_ACCESS_KEY" "$MC_SECRET_KEY" > /dev/null 2>&1; do
  sleep 1
done

echo "MinIO is ready. Creating bucket '$BUCKET_NAME'..."
mc mb "$MC_ALIAS/$BUCKET_NAME" --ignore-existing

echo "Setting bucket '$BUCKET_NAME' to public..."
mc policy set public "$MC_ALIAS/$BUCKET_NAME"

echo "MinIO initialization complete."

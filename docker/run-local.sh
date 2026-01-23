#!/usr/bin/env bash
set -euo pipefail

# Run locally with pure Docker (no host.docker.internal)
# Services: backend (9000), frontend (8080)
# Requires an existing PostgreSQL. Provide DB env vars before running:
#   export DB_HOST=localhost
#   export DB_PORT=5432
#   export DB_NAME=presente_db
#   export DB_USER=presente_user
#   export DB_PASSWORD='Presente_pwd#123'
# Usage:
#   ./docker/run-local.sh
# After start:
#   Frontend: http://localhost:8080
#   Backend API (optional direct): http://localhost:9000

# Tip: se seu Postgres está na própria máquina (host) e você usa Linux, o IP padrão do host visto pelo container costuma ser 172.17.0.1.
# Ajuste DB_HOST abaixo conforme seu ambiente.

# banco Local
# export DB_HOST=172.17.0.1
# export DB_NAME=presente_db
# export DB_USER=presente_user
# export DB_PORT=5432

# banco supaBase (Pooler), usar IPv4
export DB_HOST="aws-0-us-west-2.pooler.supabase.com"
export DB_NAME=postgres
export DB_USER=postgres.abmlvyrmenbevbdzwhse
export DB_PORT=6543

# banco supaBase, tem que usar IPv6
# export DB_HOST=db.abmlvyrmenbevbdzwhse.supabase.co
# export DB_PORT=5432
# export DB_NAME=postgres
# export DB_USER=postgresexport

export DB_PASSWORD='Presente_pwd#123'
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=admin123
export JWT_SECRET='uma-chave-bem-longa-de-dev-32bytes-min'
export DB_URL="jdbc:postgresql://$DB_HOST:${DB_PORT:-5432}/$DB_NAME?currentSchema=presente_sh&sslmode=require&prepareThreshold=0"
echo "url: ${DB_URL}"

# Validate required DB envs
: "${DB_HOST:?Set DB_HOST localhost}"
: "${DB_NAME:?Set DB_NAME}"
: "${DB_USER:?Set DB_USER}"
: "${DB_PASSWORD:?Set DB_PASSWORD}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[run-local] Building images and starting services (back:9000, front:8080)..."
DB_PORT="${DB_PORT:-5432}" \
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}" \
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}" \
JWT_SECRET="${JWT_SECRET:-dev-secret-please-change-dev-dev-dev-32bytes-min}" \
DB_URL="$DB_URL" \
DB_USER="$DB_USER" \
DB_PASSWORD="$DB_PASSWORD" \
docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d --build

# Show status and helpful commands
echo "[run-local] Services are starting. Check status with: docker compose -f $SCRIPT_DIR/docker-compose.yml ps"
echo "[run-local] Frontend: http://localhost:8080"
echo "[run-local] Backend:  http://localhost:9000"
echo "[run-local] To stop all: ./docker/stop-local.sh"

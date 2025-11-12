#!/usr/bin/env bash
set -euo pipefail

# Run local (Docker Compose) - backend (9000) + frontend (8080)
# Requer um PostgreSQL externo já em execução. Informe os envs abaixo ou
# deixe os padrões. O backend lê DB_URL/DB_USER/DB_PASS (ver application.properties).
#   export DB_HOST=localhost
#   export DB_PORT=5432
#   export DB_NAME=presente_db
#   export DB_USER=presente_user
#   export DB_PASS='Presente_pwd#123'
# Usage:
#   ./docker/run-local.sh
# After start:
#   Frontend: http://localhost:8080
#   Backend API (optional direct): http://localhost:9000

# Dica: se o Postgres está no host Linux, o IP do host visto pelo container costuma ser 172.17.0.1
# Ajuste DB_HOST conforme seu ambiente.
export DB_HOST="${DB_HOST:-172.17.0.1}"
export DB_PORT="${DB_PORT:-5432}"
export DB_NAME="${DB_NAME:-presente_db}"
export DB_USER="${DB_USER:-presente_user}"
export DB_PASS="${DB_PASS:-Presente_pwd#123}"
#export ADMIN_USERNAME=admin
#export ADMIN_PASSWORD=admin123
export JWT_SECRET='uma-chave-bem-longa-de-dev-32bytes-min'


# Monta o JDBC URL que o backend lê via DB_URL
export DB_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?currentSchema=presente_sh"

# Validate required DB envs
: "${DB_HOST:?Set DB_HOST}"
: "${DB_NAME:?Set DB_NAME}"
: "${DB_USER:?Set DB_USER}"
: "${DB_PASS:?Set DB_PASS}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[run-local] Stopping and removing previous containers..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" down -v || true

echo "[run-local] Building images (no cache)..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" build --no-cache

# Inicia os serviços, usando as imagens que acabaram de ser construídas
echo "[run-local] Starting services (back:9000, front:8080)..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d


# Show status and helpful commands
echo "[run-local] Services are starting. Check status with: docker compose -f $SCRIPT_DIR/docker-compose.yml ps"
echo "[run-local] Frontend: http://localhost:8080"
echo "[run-local] Backend:  http://localhost:9000"
echo "[run-local] To stop all: ./docker/stop-local.sh"
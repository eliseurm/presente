#!/usr/bin/env bash
set -euo pipefail


# Exemplo baseado no seu deploy anterior:
PROJECT_ID="presente-project"
REGION="southamerica-east1"
SERVICE_BACK="presente-back"
IMAGE_BACK="southamerica-east1-docker.pkg.dev/${PROJECT_ID}/presente/${SERVICE_BACK}:latest"
DB_USERNAME="presente_user"
DB_PASSWORD='Presente_pwd#123'

# Gerar um valor único (timestamp) para forçar o restart
RESTART_VALUE=$(date +%s)

gcloud run deploy "${SERVICE_BACK}" \
  --region "${REGION}" \
  --image "${IMAGE_BACK}" \
  --platform managed \
  --allow-unauthenticated \
  --port 9000 \
  --add-cloudsql-instances "${PROJECT_ID}:${REGION}:presente-sql" \
  --set-env-vars "SPRING_PROFILES_ACTIVE=prod,DB_USER=${DB_USERNAME},DB_PASS=${DB_PASSWORD},DB_URL=jdbc:postgresql:///presente_db?cloudSqlInstance=${PROJECT_ID}:${REGION}:presente-sql&socketFactory=com.google.cloud.sql.postgres.SocketFactory,RESTART_SENTINEL=${RESTART_VALUE}"
  # Adicionei RESTART_SENTINEL=${RESTART_VALUE} no final para forçar a revisão



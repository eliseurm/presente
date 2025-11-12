#!/bin/bash
set -e

# --- CONFIGURE SUAS VARIÁVEIS AQUI ---
export GCLOUD_PROJECT="presente-project"
export GCLOUD_REGION="southamerica-east1"
export AR_REPO="presente-repo"
export BACK_IMAGE_NAME="presente-back" # Nome da imagem/serviço backend
export FRONT_IMAGE_NAME="presente-front" # Nome da imagem/serviço frontend
export CLOUD_SQL="presente-sql"
export DB_SECRET_PASSWORD="Presente_pwd#123"
# --- FIM DA CONFIGURAÇÃO ---

echo "Configurando o projeto ativo do gcloud para: ${GCLOUD_PROJECT}"
gcloud config set project ${GCLOUD_PROJECT}

export BACK_IMAGE_TAG="${GCLOUD_REGION}-docker.pkg.dev/${GCLOUD_PROJECT}/${AR_REPO}/${BACK_IMAGE_NAME}:latest"
export FRONT_IMAGE_TAG="${GCLOUD_REGION}-docker.pkg.dev/${GCLOUD_PROJECT}/${AR_REPO}/${FRONT_IMAGE_NAME}:latest"
export SQL_INSTANCE="${GCLOUD_PROJECT}:${GCLOUD_REGION}:${CLOUD_SQL}"

echo "Navegando para o diretório raiz do projeto..."
# Garante que estamos na pasta docker antes de subir um nível
if [[ "$(basename "$PWD")" == "docker" ]]; then
  cd ..
else
  echo "Aviso: Script não executado a partir da pasta 'docker/'. Assumindo que já está na raiz do projeto."
fi


# --- Construir Imagem Backend ---
echo "Construindo a imagem Backend: ${BACK_IMAGE_TAG}"
#docker build --no-cache -t "${BACK_IMAGE_TAG}" -f docker/dockerfile.back .
docker build -t "${BACK_IMAGE_TAG}" -f docker/dockerfile.back .

# --- Construir Imagem Frontend ---
echo "Construindo a imagem Frontend: ${FRONT_IMAGE_TAG}"
docker build --no-cache -t "${FRONT_IMAGE_TAG}" -f docker/dockerfile.front .
#docker build -t "${FRONT_IMAGE_TAG}" -f docker/dockerfile.front .

echo "Enviando imagens para o Artifact Registry..."
gcloud auth configure-docker ${GCLOUD_REGION}-docker.pkg.dev
docker push "${BACK_IMAGE_TAG}"
docker push "${FRONT_IMAGE_TAG}"
echo "Imagens enviadas com sucesso!"

# --- Lógica do Segredo ---
echo "Garantindo que o segredo 'db_password' existe e está atualizado..."
if ! gcloud secrets describe db_password >/dev/null 2>&1; then
  echo "Segredo 'db_password' não encontrado. Criando..."
  echo -n "${DB_SECRET_PASSWORD}" | gcloud secrets create db_password --replication-policy="automatic" --data-file=-
else
  echo "Segredo 'db_password' já existe. Adicionando uma nova versão..."
  echo -n "${DB_SECRET_PASSWORD}" | gcloud secrets versions add db_password --data-file=-
fi

# --- Permissões para a Conta de Serviço do Backend ---
echo "Garantindo permissões para a conta de serviço padrão do Cloud Run (usada pelo Backend)..."
export GCLOUD_PROJECT_NUMBER=$(gcloud projects describe ${GCLOUD_PROJECT} --format="value(projectNumber)")
export GCLOUD_SERVICE_ACCOUNT_EMAIL="${GCLOUD_PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Permitindo que ${GCLOUD_SERVICE_ACCOUNT_EMAIL} acesse o segredo 'db_password'..."
gcloud secrets add-iam-policy-binding db_password \
  --member="serviceAccount:${GCLOUD_SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" --condition=None 2>/dev/null || echo "Permissão de Secret Accessor provavelmente já existe."

echo "Permitindo que ${GCLOUD_SERVICE_ACCOUNT_EMAIL} conecte-se ao Cloud SQL..."
gcloud projects add-iam-policy-binding ${GCLOUD_PROJECT} \
  --member="serviceAccount:${GCLOUD_SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/cloudsql.client" --condition=None 2>/dev/null || echo "Permissão de Cloud SQL Client provavelmente já existe."

# --- Permissão para o Frontend invocar o Backend ---
echo "Concedendo permissão de Cloud Run Invoker para o Frontend..."
gcloud run services add-iam-policy-binding ${BACK_IMAGE_NAME} \
  --member="serviceAccount:${GCLOUD_SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.invoker" \
  --region="${GCLOUD_REGION}" --condition=None 2>/dev/null || echo "Permissão Invoker provavelmente já existe."


# --- Implantar Serviço Backend ---
echo "Implantando o serviço Backend (${BACK_IMAGE_NAME})..."
gcloud run deploy ${BACK_IMAGE_NAME} \
  --image "${BACK_IMAGE_TAG}" \
  --region "${GCLOUD_REGION}" \
  --add-cloudsql-instances "${SQL_INSTANCE}" \
  --set-env-vars "DB_URL=jdbc:postgresql:///presente_db?cloudSqlInstance=${SQL_INSTANCE}&socketFactory=com.google.cloud.sql.postgres.SocketFactory&currentSchema=presente_sh,DB_USER=presente_user,SERVER_PORT=9000" \
  --set-secrets "DB_PASS=db_password:latest" \
  --memory=3Gi \
  --allow-unauthenticated --ingress internal-and-cloud-load-balancing # Habilita a autenticação e Restringe a origem (apenas Cloud Run/VPC)

echo "Backend implantado!"

# --- DEFINIÇÃO DA URL DE PROXY INTERNA ---
# Usa o nome do serviço e a porta interna diretamente para roteamento DNS interno do Cloud Run.
BACKEND_PROXY_URL="http://${BACK_IMAGE_NAME}:9000" # Ex: http://presente-back:9000

# --- Implantar Serviço Frontend ---
echo "Implantando o serviço Frontend (${FRONT_IMAGE_NAME})..."
gcloud run deploy ${FRONT_IMAGE_NAME} \
  --image "${FRONT_IMAGE_TAG}" \
  --region "${GCLOUD_REGION}" \
  --set-env-vars "BACKEND_PROXY_URL=${BACKEND_PROXY_URL}" \
  --memory=1Gi \
  --allow-unauthenticated

echo "Frontend implantado!"
echo "URL do Frontend: $(gcloud run services describe ${FRONT_IMAGE_NAME} --region=${GCLOUD_REGION} --format='value(status.url)')"
echo "Deploy concluído!"


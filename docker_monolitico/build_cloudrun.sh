#!/bin/bash
set -e

# --- CONFIGURE SUAS VARIÁVEIS AQUI ---
export GCLOUD_PROJECT="presente-project" # ID do servico do Cloud run
export GCLOUD_REGION="southamerica-east1" # Regiao
export AR_REPO="presente-repo" # area de repositorio de dokers (tipo DockerHub)
export IMAGE_NAME="presente-monolith"
export CLOUD_SQL="presente-sql"
export DB_SECRET_PASSWORD="Presente_pwd#123" # Senha do banco que será salva no Secret
# --- FIM DA CONFIGURAÇÃO ---

# --- COMANDO ADICIONADO ---
# Define o projeto ativo na configuração do gcloud
# Isso garante que todos os comandos subsequentes usem o projeto correto.
echo "Configurando o projeto ativo do gcloud para: ${GCLOUD_PROJECT}"
gcloud config set project ${GCLOUD_PROJECT}
# --- FIM DO COMANDO ADICIONADO ---

export IMAGE_TAG="${GCLOUD_REGION}-docker.pkg.dev/${GCLOUD_PROJECT}/${AR_REPO}/${IMAGE_NAME}:latest"
export SQL_INSTANCE="${GCLOUD_PROJECT}:${GCLOUD_REGION}:${CLOUD_SQL}"
# ex: presente-project:southamerica-east1:presente-sql

echo "Construindo a imagem: ${IMAGE_TAG}"

# Navega para o diretório raiz do projeto (um nível acima de 'docker/')
cd ..

# Executa o build a partir da raiz, especificando o caminho para o Dockerfile
# --- Garante que --no-cache está ativo ---
#docker build --no-cache -t "${IMAGE_TAG}" -f docker/Dockerfile .
docker build -t "${IMAGE_TAG}" -f docker/Dockerfile .

echo "Enviando a imagem para o Artifact Registry..."

# Autentica o Docker com o Google Cloud
gcloud auth configure-docker ${GCLOUD_REGION}-docker.pkg.dev

# Envia a imagem
docker push "${IMAGE_TAG}"
echo "Imagem enviada com sucesso!"

# --- NOVOS COMANDOS DE PERMISSÃO ---
echo "Garantindo permissões para a conta de serviço padrão do Cloud Run..."

# --- LÓGICA DO SEGREDO ATUALIZADA ---
# 0. Garante que o segredo 'db_password' existe e atualiza a senha.
echo "Verificando se o segredo 'db_password' existe..."
if ! gcloud secrets describe db_password >/dev/null 2>&1; then
  echo "Segredo 'db_password' não encontrado. Criando..."
  # Usamos 'echo -n' para não adicionar uma nova linha à senha
  echo -n "${DB_SECRET_PASSWORD}" | gcloud secrets create db_password --replication-policy="automatic" --data-file=-
else
  echo "Segredo 'db_password' já existe. Adicionando uma nova versão com a senha correta..."
  # Isso força a atualização da senha para o valor em DB_SECRET_PASSWORD
  echo -n "${DB_SECRET_PASSWORD}" | gcloud secrets versions add db_password --data-file=-
fi
# --- FIM DA LÓGICA ATUALIZADA ---

# 1. Obter o NÚMERO do projeto (ex: 444056920619)
export GCLOUD_PROJECT_NUMBER=$(gcloud projects describe ${GCLOUD_PROJECT} --format="value(projectNumber)")

# 2. Definir a conta de serviço (é a conta de serviço PADRÃO do Compute/Cloud Run)
export GCLOUD_SERVICE_ACCOUNT_EMAIL="${GCLOUD_PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# 3. Dar a essa conta de serviço a permissão para ACESSAR o segredo
# Este comando é aditivo (seguro de rodar múltiplas vezes) e corrige o erro anterior.
echo "Permitindo que ${GCLOUD_SERVICE_ACCOUNT_EMAIL} acesse o segredo 'db_password'..."
gcloud secrets add-iam-policy-binding db_password \
  --member="serviceAccount:${GCLOUD_SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

# 4. Dar a essa conta de serviço a permissão para CONECTAR ao Cloud SQL
# Isso é necessário para o Cloud SQL SocketFactory funcionar.
echo "Permitindo que ${GCLOUD_SERVICE_ACCOUNT_EMAIL} conecte-se ao Cloud SQL..."
gcloud projects add-iam-policy-binding ${GCLOUD_PROJECT} \
  --member="serviceAccount:${GCLOUD_SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/cloudsql.client"
# --- FIM DOS NOVOS COMANDOS ---


echo "Implantando nova revisão no Cloud Run (MODO DE PRODUÇÃO FINAL v3)..."

#
# --- MODO DE PRODUÇÃO FINAL v3 ---
#
# O container usa o ENTRYPOINT definido no Dockerfile (que é o entrypoint.sh simplificado).
# O Nginx usa /etc/nginx/nginx.conf (copiado diretamente do docker/nginx.conf).
# As flags --command e --args foram removidas.
#
gcloud run deploy ${IMAGE_NAME} \
  --image "${IMAGE_TAG}" \
  --region "${GCLOUD_REGION}" \
  --add-cloudsql-instances "${SQL_INSTANCE}" \
  --set-env-vars "DB_URL=jdbc:postgresql:///presente_db?cloudSqlInstance=${SQL_INSTANCE}&socketFactory=com.google.cloud.sql.postgres.SocketFactory&currentSchema=presente_sh,DB_USER=presente_user" \
  --set-secrets "DB_PASS=db_password:latest" \
  --allow-unauthenticated \
  --memory=4Gi

echo "Deploy concluído!"


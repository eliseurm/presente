#!/bin/bash
set -e

# --- CONFIGURE SUAS VARIÁVEIS AQUI ---
export GCLOUD_PROJECT="presente-project" # ID do servico do Cloud run
export GCLOUD_REGION="southamerica-east1" # Regiao
export AR_REPO="presente-repo" # area de repositorio de dokers (tipo DockerHub)
export IMAGE_NAME="presente-monolith"
# --- FIM DA CONFIGURAÇÃO ---

export IMAGE_TAG="${GCLOUD_REGION}-docker.pkg.dev/${GCLOUD_PROJECT}/${AR_REPO}/${IMAGE_NAME}:latest"

echo "Construindo a imagem: ${IMAGE_TAG}"

# Navega para o diretório raiz do projeto (um nível acima de 'docker/')
cd ..

# Executa o build a partir da raiz, especificando o caminho para o Dockerfile
# O ponto '.' no final define a raiz do projeto como o contexto de build
# docker build -t "${IMAGE_TAG}" -f docker/Dockerfile .
docker build --no-cache -t "${IMAGE_TAG}" -f docker/Dockerfile .

echo "Enviando a imagem para o Artifact Registry..."

# Autentica o Docker com o Google Cloud
gcloud auth configure-docker ${GCLOUD_REGION}-docker.pkg.dev

# Envia a imagem
docker push "${IMAGE_TAG}"
echo "Imagem enviada com sucesso!"
echo "Use esta tag ao criar seu serviço no Cloud Run: ${IMAGE_TAG}"


echo "Implantando nova revisão no Cloud Run..."
gcloud run deploy presente-monolith \
  --image "${IMAGE_TAG}" \
  --region "${GCLOUD_REGION}" \
  --allow-unauthenticated # Remova esta linha se seu serviço não for público

echo "Deploy concluído!"


#!/bin/bash

# Garante que o script pare se algum comando falhar
set -e

#
# Preparando contexto
#

if [[ -d 'backend' ]]; then
	rm -rf backend
fi
mkdir backend


if [[ -d 'frontend' ]]; then
	rm -rf frontend
fi
mkdir frontend



#
# build docker backend
#

echo "*"
echo "* Build backend: "
echo "*"

cp Dockerfile_backend backend/Dockerfile

cd ../back
export JAVA_HOME=/opt/java/jdk-17.0.6+10
export PATH=$JAVA_HOME/bin:$PATH
mvn clean install

if [[ $? != 0 ]]; then
	echo "Falha ao compilar backend"
	exit 1
fi

cd ../docker

cp ../back/target/presente-0.0.1-SNAPSHOT.jar backend/


#
# build docker frontend
#

echo "*"
echo "* Build frontend: "
echo "*"

cp nginx/* frontend/

cp Dockerfile_frontend frontend/Dockerfile

cd ../front

# Carrega o NVM para que o comando 'nvm' esteja disponível
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
else
  echo "Erro: NVM não encontrado em $NVM_DIR"
  exit 1
fi
nvm use 20

npm install

if [[ $? != 0 ]]; then
	echo "Falha ao compilar frontend"
	exit 1
fi

npm run ng build -- --output-path=dist --configuration production

if [[ $? != 0 ]]; then
	echo "Falha ao compilar frontend"
	exit 1
fi


cd ../docker

cp -r ../front/dist frontend/dist


echo "*"
echo "* Montando docker: "
echo "*"

#
#Enviando imagens docker para repositorio
#
#docker-compose up --build --force-recreate
docker-compose build
docker tag docker_presentefrontend docker.sonner.com.br:9443/clubefrontend:latest
docker tag docker_clubebackend docker.sonner.com.br:9443/clubebackend:latest

docker login -u admin -p '@Pocalipse#003' 'https://docker.sonner.com.br:9443/'

docker push docker.sonner.com.br:9443/clubefrontend:latest
docker push docker.sonner.com.br:9443/clubebackend:latest













































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
#cp ../back/pom.xml backend/


#
# build docker frontend
#

echo "*"
echo "* Build frontend: "
echo "*"

cp -r nginx/* frontend/

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
# Baixando os containers deste docker-compose
docker-compose down

#docker-compose up --build --force-recreate
#docker-compose build
docker-compose up --build -d


docker tag docker_presentefrontend eliseurm/docker_presentefrontend
docker tag docker_presentebackend eliseurm/docker_presentebackend

docker login -u eliseurm -p 'senha'

docker push eliseurm/docker_presentefrontend:latest
docker push eliseurm/docker_presentebackend:latest


#!/bin/bash

echo Baixando do repositorio...
#docker-compose pull

echo Parando.. 
docker-compose stop

echo Removendo...
docker-compose rm -f

echo Subindo...
docker-compose up -d

echo Show
docker-compose ps



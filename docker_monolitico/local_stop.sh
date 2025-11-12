#!/bin/bash
set -e

echo "Parando o ambiente de teste local..."

docker-compose -f local_docker-compose.yml down

echo "Ambiente local parado."

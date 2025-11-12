#!/bin/sh

echo "Iniciando Java (backend) em background na porta 9000..."
# Assume que o application.properties define a porta do Java como 9000
java -jar /app/app.jar &

echo "Iniciando Nginx (frontend) em foreground na porta 8080..."
# O nginx usa diretamente a configuração de /etc/nginx/nginx.conf
# copiada do docker/nginx.conf durante o build.
nginx -g 'daemon off;'
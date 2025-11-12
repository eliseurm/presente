#!/bin/sh
set -e

# A variável PROXY_URL é injetada (e.g., http://presente-back:9000)
export PROXY_URL="${BACKEND_PROXY_URL}"

# Substitui as variáveis (PROXY_URL e PORT) no template do Nginx
envsubst '$$PORT $$PROXY_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Inicia o Nginx (o processo principal)
exec nginx -g 'daemon off;'
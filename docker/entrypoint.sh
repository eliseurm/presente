#!/bin/sh

# Garante que o script pare se houver erro
set -e

# O Cloud Run define a variável de ambiente PORT. Usamos 'sed' para substituir
# a porta no arquivo de configuração do Nginx. O padrão é 8080 se PORT não estiver definida.
echo "Configurando Nginx para ouvir na porta ${PORT:-8080}..."
sed -i "s/LISTEN_PORT/${PORT:-8080}/g" /etc/nginx/nginx.conf.template

# Copia o template diretamente para o arquivo de configuração principal do Nginx
cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf

# Copia o arquivo configurado para o local final do Nginx
#cp /etc/nginx/nginx.conf.template /etc/nginx/conf.d/default.conf

# Inicia o backend Java em segundo plano, passando as variáveis de ambiente
# O Spring Boot automaticamente usará as variáveis de ambiente para a conexão com o banco
echo "Iniciando aplicação backend..."
java -jar /app/app.jar &

# Inicia o Nginx em primeiro plano para manter o contêiner ativo
echo "Iniciando Nginx..."
nginx -g 'daemon off;'


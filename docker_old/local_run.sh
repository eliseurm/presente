
#!/bin/bash
set -e

echo "Construindo e iniciando o ambiente de teste local..."

# O -f especifica qual arquivo compose usar
# --build força a reconstrução da imagem da sua aplicação se houver mudanças
# -d executa em segundo plano (detached)
docker-compose -f local_docker-compose.yml up --build -d

echo ""
echo "Ambiente local iniciado com sucesso!"
echo "Acesse o frontend em: http://localhost:8080"
echo "O banco de dados está acessível na porta 5433 da sua máquina."

#!/bin/bash

# Script para executar build e testes automaticamente

echo "🔨 Construindo aplicação web..."
npm run build:web

if [ $? -ne 0 ]; then
    echo "❌ Erro ao construir a aplicação"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo "🧪 Executando testes E2E..."

npm run test:e2e:auto

if [ $? -eq 0 ]; then
    echo "✅ Todos os testes passaram!"
    exit 0
else
    echo "❌ Alguns testes falharam. Verifique o relatório."
    exit 1
fi



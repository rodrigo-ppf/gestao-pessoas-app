#!/bin/bash

# Script de Deploy Corrigido - Mantém package.json correto
echo "🚀 Iniciando deploy corrigido..."

# 1. Fazer build da aplicação
echo "📦 Fazendo build da aplicação..."
npm run build:production

# 2. Copiar servidor para a pasta dist
echo "📋 Copiando servidor..."
cp server.robust.js dist/server.js

# 3. Usar package.json mínimo e NÃO restaurar
echo "📄 Configurando package.json mínimo (permanente)..."
cp package.minimal.json package.json

# 4. Fazer deploy
echo "☁️ Fazendo deploy para Google App Engine..."
gcloud app deploy --quiet

echo "✅ Deploy concluído com sucesso!"
echo "🌐 URL: https://gestao-pessoas-app-2024-471821.uc.r.appspot.com"
echo "⚠️  IMPORTANTE: package.json foi alterado para produção!"

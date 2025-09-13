#!/bin/bash

# Script de Deploy Otimizado para Google App Engine
# Reduz o tamanho do deploy de 368MB para ~5MB

echo "🚀 Iniciando deploy otimizado..."

# 1. Fazer build da aplicação
echo "📦 Fazendo build da aplicação..."
npm run build:production

# 2. Copiar servidor para a pasta dist
echo "📋 Copiando servidor..."
cp server.robust.js dist/server.js

# 3. Usar package.json mínimo
echo "📄 Configurando package.json mínimo..."
cp package.minimal.json package.json

# 4. Fazer deploy
echo "☁️ Fazendo deploy para Google App Engine..."
gcloud app deploy --quiet

# 5. Restaurar package.json original
echo "🔄 Restaurando package.json original..."
git checkout package.json

echo "✅ Deploy concluído com sucesso!"
echo "🌐 URL: https://gestao-pessoas-app-2024-471821.uc.r.appspot.com"

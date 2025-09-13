@echo off
REM Script de Deploy Corrigido - Mantém package.json correto
echo 🚀 Iniciando deploy corrigido...

REM 1. Fazer build da aplicação
echo 📦 Fazendo build da aplicação...
call npm run build:production

REM 2. Copiar servidor para a pasta dist
echo 📋 Copiando servidor...
copy server.robust.js dist\server.js

REM 3. Usar package.json mínimo e NÃO restaurar
echo 📄 Configurando package.json mínimo (permanente)...
copy package.minimal.json package.json

REM 4. Fazer deploy
echo ☁️ Fazendo deploy para Google App Engine...
call gcloud app deploy --quiet

echo ✅ Deploy concluído com sucesso!
echo 🌐 URL: https://gestao-pessoas-app-2024-471821.uc.r.appspot.com
echo ⚠️  IMPORTANTE: package.json foi alterado para produção!

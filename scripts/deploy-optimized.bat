@echo off
REM Script de Deploy Otimizado para Google App Engine (Windows)
REM Reduz o tamanho do deploy de 368MB para ~5MB

echo 🚀 Iniciando deploy otimizado...

REM 1. Fazer build da aplicação
echo 📦 Fazendo build da aplicação...
call npm run build:production

REM 2. Copiar servidor para a pasta dist
echo 📋 Copiando servidor...
copy server.robust.js dist\server.js

REM 3. Usar package.json mínimo
echo 📄 Configurando package.json mínimo...
copy package.minimal.json package.json

REM 4. Fazer deploy
echo ☁️ Fazendo deploy para Google App Engine...
call gcloud app deploy --quiet

REM 5. Restaurar package.json original
echo 🔄 Restaurando package.json original...
call git checkout package.json

echo ✅ Deploy concluído com sucesso!
echo 🌐 URL: https://gestao-pessoas-app-2024-471821.uc.r.appspot.com

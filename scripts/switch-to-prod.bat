@echo off
REM Script para alternar para modo de produção
echo 🚀 Alternando para modo de produção...

REM Usar package.json mínimo
copy package.minimal.json package.json

echo ✅ Modo de produção ativado!
echo 📦 Pronto para deploy com 'gcloud app deploy --quiet'

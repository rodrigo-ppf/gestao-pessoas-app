@echo off
REM Script para voltar ao modo de desenvolvimento
echo 🔄 Alternando para modo de desenvolvimento...

REM Restaurar package.json original
copy package.dev.json package.json

echo ✅ Modo de desenvolvimento ativado!
echo 📝 Use 'npm start' para desenvolvimento local
echo 🚀 Use 'scripts/deploy-fixed.bat' para deploy em produção

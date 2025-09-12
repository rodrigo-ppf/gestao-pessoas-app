# Script PowerShell para build web
Write-Host "🔧 Preparando build para web..." -ForegroundColor Green

# Criar arquivo CSS necessário para o expo-router
Write-Host "📁 Criando arquivo CSS necessário..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "node_modules/expo-router/assets" | Out-Null
"/* Arquivo CSS vazio para resolver problema do expo-router */" | Out-File -FilePath "node_modules/expo-router/assets/modal.module.css" -Encoding UTF8

# Verificar se o arquivo foi criado
if (Test-Path "node_modules/expo-router/assets/modal.module.css") {
    Write-Host "✅ Arquivo CSS criado com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao criar arquivo CSS" -ForegroundColor Red
    exit 1
}

# Build para web
Write-Host "🚀 Iniciando build para web..." -ForegroundColor Yellow
npx expo export --platform web --clear

# Verificar se o build foi criado
if (Test-Path "dist") {
    Write-Host "✅ Build criado com sucesso" -ForegroundColor Green
    Write-Host "📊 Conteúdo da pasta dist:" -ForegroundColor Yellow
    Get-ChildItem -Path "dist" | Format-Table
} else {
    Write-Host "❌ Erro ao criar build" -ForegroundColor Red
    exit 1
}

# Copiar arquivos necessários para o App Engine
Write-Host "📋 Copiando arquivos para App Engine..." -ForegroundColor Yellow
Copy-Item "server.js" "dist/"
Copy-Item "package.json" "dist/"
Copy-Item "app.yaml" "dist/"

Write-Host "🎉 Build concluído com sucesso!" -ForegroundColor Green

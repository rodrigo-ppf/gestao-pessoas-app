# Script PowerShell para executar build e testes automaticamente

Write-Host "🔨 Construindo aplicação web..." -ForegroundColor Cyan
npm run build:web

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao construir a aplicação" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
Write-Host "🧪 Executando testes E2E..." -ForegroundColor Cyan

npm run test:e2e:auto

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Todos os testes passaram!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Alguns testes falharam. Verifique o relatório." -ForegroundColor Red
    exit 1
}



# 🚀 Execução Automática de Testes

Os testes E2E estão configurados para executar automaticamente de várias formas:

## ⚙️ Configuração Automática

### 1. Servidor Automático no Playwright

O Playwright está configurado para **iniciar o servidor automaticamente** antes de executar os testes. Isso significa que você não precisa iniciar o servidor manualmente!

```bash
# Simplesmente execute os testes - o servidor será iniciado automaticamente
npm test
# ou
npm run test:e2e:auto
```

O Playwright irá:
1. ✅ Executar `npm run build:web` automaticamente
2. ✅ Iniciar o servidor na porta 8081
3. ✅ Aguardar o servidor estar pronto
4. ✅ Executar os testes
5. ✅ Fechar o servidor após os testes

### 2. Scripts Disponíveis

#### Testes Básicos
```bash
# Executa testes (servidor inicia automaticamente)
npm test
# ou
npm run test:e2e:auto
```

#### Build + Testes
```bash
# Força rebuild e executa testes
npm run test:e2e:full
```

#### Testes Interativos
```bash
# Interface visual para debugar testes
npm run test:e2e:ui

# Modo debug passo a passo
npm run test:e2e:debug

# Com navegador visível
npm run test:e2e:headed
```

#### Ver Relatório
```bash
# Abre relatório HTML dos últimos testes
npm run test:e2e:report
```

## 🔄 Execução Automática Após Build

Após executar `npm run build:web`, você verá uma mensagem lembrando de executar os testes:

```bash
npm run build:web
# ... build ...
# Build concluído. Execute npm test para rodar os testes.
```

## 🎯 Quando os Testes São Executados

### Automático
- ✅ **Ao executar `npm test`** - Servidor inicia automaticamente
- ✅ **Ao executar `npm run test:e2e:auto`** - Servidor inicia automaticamente
- ✅ **Ao executar `npm run test:e2e:full`** - Build + Testes

### Manual (se necessário)
Se você quiser iniciar o servidor manualmente:

```bash
# Terminal 1: Build e servidor
npm run build:web
npx serve dist -p 8081

# Terminal 2: Testes (sem iniciar servidor)
npm run test:e2e
```

## 📝 Hooks do Git (Opcional)

Para executar testes automaticamente antes de cada commit, ative o hook:

```bash
# Linux/Mac
chmod +x .git/hooks/pre-commit.sample
mv .git/hooks/pre-commit.sample .git/hooks/pre-commit

# Windows (PowerShell)
Copy-Item .git/hooks/pre-commit.sample .git/hooks/pre-commit
```

⚠️ **Nota**: O hook pode ser lento. Use apenas se necessário.

## 🛠️ Troubleshooting

### Servidor não inicia automaticamente

Se o servidor não iniciar automaticamente:

1. Verifique se `npx serve` está instalado:
   ```bash
   npx serve --version
   ```

2. Verifique se a porta 8081 está livre:
   ```bash
   # Windows
   netstat -ano | findstr :8081
   
   # Linux/Mac
   lsof -i :8081
   ```

3. Execute manualmente:
   ```bash
   npm run test:e2e:full
   ```

### Testes muito lentos

Se os testes estiverem muito lentos:

1. Aumente o timeout no `playwright.config.ts`
2. Execute apenas testes específicos:
   ```bash
   npm test -- tests/navigation/login-flow.spec.ts
   ```

### Servidor já está rodando

O Playwright detecta automaticamente se o servidor já está rodando e reutiliza. Se houver problemas, feche o servidor manualmente antes de executar os testes.

## 📊 Relatórios

Após executar os testes, você pode ver o relatório HTML:

```bash
npm run test:e2e:report
```

O relatório inclui:
- ✅ Screenshots de falhas
- ✅ Vídeos de falhas
- ✅ Traces de execução
- ✅ Timeline de cada teste

## 🎉 Resumo

**Para executar testes automaticamente, simplesmente:**

```bash
npm test
```

O Playwright cuida de tudo! 🚀



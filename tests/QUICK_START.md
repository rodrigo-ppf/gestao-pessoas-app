# 🚀 Guia Rápido - Testes E2E

## Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Instalar navegadores do Playwright
npx playwright install
```

## Executar Testes

### 1. Iniciar a aplicação

Em um terminal, inicie a aplicação web:

```bash
# Opção 1: Build e servir
npm run build:web
npx serve dist -p 8081

# Opção 2: Servidor de desenvolvimento
npm run web
```

### 2. Executar testes

Em outro terminal:

```bash
# Executar todos os testes
npm run test:e2e

# Executar com interface visual (recomendado para começar)
npm run test:e2e:ui

# Executar em modo debug (passo a passo)
npm run test:e2e:debug

# Executar com navegador visível
npm run test:e2e:headed
```

## O que os testes fazem?

### ✅ Testes de Navegação
- **Login Flow**: Testa login, redirecionamento, validações
- **Cadastro Líder Flow**: Testa cadastro, validações, navegação

### ✅ Testes de Integração
- **Cross-Screen Dependencies**: Garante que navegação entre telas funciona
- **Regression Tests**: Detecta quebras quando código é alterado

## Exemplo: Detectar quebra após alteração

Se você alterar o código de `cadastro-lider.tsx` e quebrar algo:

1. Execute os testes:
   ```bash
   npm run test:e2e
   ```

2. Os testes vão falhar se:
   - Campos do formulário desaparecerem
   - Validações pararem de funcionar
   - Navegação quebrar
   - Botões pararem de funcionar

3. Veja o relatório:
   ```bash
   npm run test:e2e:report
   ```

## Dicas

- Use `test:e2e:ui` para ver os testes rodando visualmente
- Use `test:e2e:debug` para debugar testes que estão falhando
- Os testes são executados em paralelo por padrão
- Screenshots e vídeos são salvos automaticamente quando há falhas

## Troubleshooting

**Erro: "Cannot find module '@playwright/test'"**
```bash
npm install
```

**Erro: "Browser not found"**
```bash
npx playwright install
```

**Testes falhando por timeout**
- Verifique se a aplicação está rodando na porta 8081
- Aumente o timeout no `playwright.config.ts` se necessário

**URL incorreta**
```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```



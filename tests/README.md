# Testes E2E com Playwright

Este diretório contém testes end-to-end (E2E) usando Playwright para garantir que a aplicação funciona corretamente e que alterações no código não quebrem funcionalidades relacionadas.

## Estrutura

```
tests/
├── navigation/              # Testes de navegação
│   ├── login-flow.spec.ts   # Testes do fluxo de login
│   └── cadastro-lider-flow.spec.ts  # Testes do fluxo de cadastro de líder
├── integration/             # Testes de integração
│   ├── cross-screen-dependencies.spec.ts  # Testes de dependências entre telas
│   └── regression-tests.spec.ts          # Testes de regressão
└── helpers/                 # Helpers para testes
    └── auth-helper.ts       # Helper de autenticação
```

## Como Executar

### Instalar dependências

```bash
npm install
npx playwright install
```

### Executar todos os testes

```bash
npm run test:e2e
```

### Executar testes em modo UI (interativo)

```bash
npm run test:e2e:ui
```

### Executar testes em modo debug

```bash
npm run test:e2e:debug
```

### Executar testes específicos

```bash
npx playwright test tests/navigation/login-flow.spec.ts
```

### Executar testes em um navegador específico

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Configuração

### URL Base

Por padrão, os testes usam `http://localhost:8081`. Para alterar, defina a variável de ambiente:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

### Servidor de Desenvolvimento

Os testes assumem que a aplicação já está rodando. Para iniciar a aplicação:

```bash
npm run build:web
npx serve dist -p 8081
```

Ou use o servidor de desenvolvimento do Expo:

```bash
npm run web
```

## Tipos de Testes

### Testes de Navegação

Testam fluxos específicos de navegação:
- Login e redirecionamento
- Cadastro de líder
- Navegação entre telas

### Testes de Integração

Testam dependências entre diferentes partes da aplicação:
- Dependências entre telas
- Manutenção de estado
- Fluxos completos

### Testes de Regressão

Detectam quebras quando código é alterado:
- Rotas quebradas
- Formulários quebrados
- Validações quebradas
- Redirecionamentos quebrados

## Boas Práticas

1. **Isolamento**: Cada teste deve ser independente
2. **Limpeza**: Limpar estado antes de cada teste
3. **Aguardar**: Sempre aguardar elementos antes de interagir
4. **Seletores**: Usar seletores robustos que não quebram facilmente
5. **Timeouts**: Usar timeouts apropriados para operações assíncronas

## Adicionando Novos Testes

1. Crie um arquivo `.spec.ts` no diretório apropriado
2. Use `test.describe` para agrupar testes relacionados
3. Use `test.beforeEach` para setup comum
4. Escreva testes descritivos com `test()`
5. Use `expect` para fazer asserções

Exemplo:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nova Funcionalidade', () => {
  test.beforeEach(async ({ page }) => {
    // Setup comum
  });

  test('deve fazer algo específico', async ({ page }) => {
    // Teste
    await page.goto('/rota');
    await expect(page.locator('text=Algo')).toBeVisible();
  });
});
```

## Troubleshooting

### Testes falhando

1. Verifique se a aplicação está rodando
2. Verifique se a URL base está correta
3. Verifique os logs no console
4. Execute em modo debug para ver o que está acontecendo

### Timeouts

Se testes estão falhando por timeout:
1. Aumente o timeout no `playwright.config.ts`
2. Verifique se a aplicação está respondendo rapidamente
3. Adicione `waitForTimeout` quando necessário

### Seletores não encontrados

Se seletores não estão sendo encontrados:
1. Use seletores mais genéricos
2. Adicione timeouts apropriados
3. Verifique se o elemento realmente existe na página
4. Use `page.locator().count()` para verificar existência



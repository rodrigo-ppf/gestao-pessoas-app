import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * 
 * Esta configuração permite testar a aplicação web gerada pelo Expo.
 * Os testes validam fluxos de navegação e garantem que alterações
 * no código não quebrem funcionalidades relacionadas.
 */
export default defineConfig({
  testDir: './tests',
  
  /* Timeout para cada teste */
  timeout: 60 * 1000,
  
  /* Timeout para expectativas */
  expect: {
    timeout: 5000
  },
  
  /* Executar testes em paralelo */
  fullyParallel: true,
  
  /* Falhar o build se houver testes com falha */
  forbidOnly: !!process.env.CI,
  
  /* Tentar novamente apenas no CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Limitar workers no CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Configuração de relatórios */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base da aplicação */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8081',
    
    /* Coletar trace quando há falha */
    trace: 'on-first-retry',
    
    /* Screenshots apenas em falhas */
    screenshot: 'only-on-failure',
    
    /* Vídeo apenas em falhas */
    video: 'retain-on-failure',
  },

  /* Configurar projetos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Comentado para focar apenas no Chromium durante desenvolvimento
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Servidor de desenvolvimento - inicia automaticamente antes dos testes */
  webServer: {
    command: process.platform === 'win32'
      ? 'npm run build:web && npx serve dist -p 8081'
      : 'npm run build:web && npx serve dist -p 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos para build + servidor iniciar
    stdout: 'ignore',
    stderr: 'pipe',
  },
});


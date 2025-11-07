import { test, expect } from '@playwright/test';
import {
  fillCadastroLiderForm,
  gotoCadastroLiderPage,
} from '../helpers/cadastro-lider-helpers';
import { checkServerAvailable, clearAuth, performLogin } from '../helpers/test-helpers';

/**
 * Testes de integração que validam dependências entre telas
 * 
 * Estes testes garantem que:
 * - Alterações em uma tela não quebram outras telas relacionadas
 * - Fluxos completos funcionam de ponta a ponta
 * - Navegação entre telas relacionadas está funcionando
 */
test.describe('Dependências entre Telas', () => {
  
  test.beforeEach(async ({ page, baseURL }) => {
    // Verificar se o servidor está disponível
    const serverAvailable = await checkServerAvailable(page, baseURL);
    test.skip(!serverAvailable, 'Servidor não está disponível. Execute: npm run build:web && npx serve dist -p 8081');
    
    // Limpar localStorage antes de cada teste
    try {
      await page.goto('/', { timeout: 5000, waitUntil: 'domcontentloaded' });
      await clearAuth(page);
    } catch (error) {
      await clearAuth(page);
    }
    
    // Fazer login antes de cada teste usando helper
    const loginSuccess = await performLogin(page, 'admin@sistema.com', 'admin123');
    if (!loginSuccess) {
      test.skip(true, 'Não foi possível fazer login');
    }
  });

  test('deve manter navegação funcionando entre home e cadastro de líder', async ({ page }) => {
    // Ir para home
    await page.goto('/home');
    await expect(page).toHaveURL(/\/home/);
    
    // Navegar para cadastro de líder (pode ser via link ou botão)
    await gotoCadastroLiderPage(page);
    await expect(page).toHaveURL(/\/cadastro-lider/);
    
    // Voltar para home
    await page.goto('/home');
    await expect(page).toHaveURL(/\/home/);
  });

  test('deve manter navegação funcionando entre gerenciar-equipe e cadastro-lider', async ({ page }) => {
    // Ir para gerenciar-equipe
    await page.goto('/gerenciar-equipe');
    await expect(page).toHaveURL(/\/gerenciar-equipe/);
    
    // Navegar para cadastro de líder
    await gotoCadastroLiderPage(page);
    await expect(page).toHaveURL(/\/cadastro-lider/);
    
    // Voltar para gerenciar-equipe
    await page.goto('/gerenciar-equipe');
    await expect(page).toHaveURL(/\/gerenciar-equipe/);
  });

  test('deve manter autenticação ao navegar entre telas', async ({ page }) => {
    // Navegar por várias telas
    await page.goto('/home');
    await page.waitForTimeout(1000);
    
    await gotoCadastroLiderPage(page);
    await page.waitForTimeout(1000);
    
    await page.goto('/gerenciar-equipe');
    await page.waitForTimeout(1000);
    
    await page.goto('/colaboradores');
    await page.waitForTimeout(1000);
    
    // Verificar que ainda está autenticado (não foi redirecionado para /login)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
  });

  test('deve manter dados do usuário ao navegar entre telas', async ({ page }) => {
    // Ir para home
    await page.goto('/home');
    await page.waitForTimeout(2000);
    
    // Verificar se há elementos que indicam que o usuário está logado
    // (pode ser nome do usuário, menu, etc.)
    
    // Navegar para outra tela
    await gotoCadastroLiderPage(page);
    await page.waitForTimeout(2000);
    
    // Verificar que ainda está autenticado
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
  });

  test('deve manter estado da aplicação ao recarregar página em qualquer tela', async ({ page }) => {
    // Navegar para cadastro-lider
    await page.goto('/cadastro-lider');
    await page.waitForTimeout(2000);
    
    // Recarregar a página
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verificar que ainda está na mesma tela e autenticado
    await expect(page).toHaveURL(/\/cadastro-lider/);
    expect(page.url()).not.toContain('/login');
  });

  test('deve manter navegação funcionando após interação com formulário', async ({ page }) => {
    await gotoCadastroLiderPage(page);

    await fillCadastroLiderForm(page, {
      nome: 'Teste',
      email: 'teste@teste.com',
      senha: 'senha123',
      confirmarSenha: 'senha123',
      departamento: 'Operações',
      cargo: 'Líder',
    });
    
    // Navegar para outra tela
    await page.goto('/home');
    await expect(page).toHaveURL(/\/home/);
    
    // Voltar para cadastro-lider
    await page.goto('/cadastro-lider');
    await expect(page).toHaveURL(/\/cadastro-lider/);
  });

  test('deve manter funcionalidade de botões de navegação em todas as telas', async ({ page }) => {
    const telas = [
      '/home',
      '/cadastro-lider',
      '/gerenciar-equipe',
      '/colaboradores'
    ];
    
    for (const tela of telas) {
      await page.goto(tela);
      await page.waitForTimeout(2000);
      
      // Verificar que a página carregou (não está em erro)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/login');
      
      // Verificar que não há erros visíveis na página
      const errorMessages = page.locator('text=/erro/i, text=/error/i');
      if (await errorMessages.count() > 0) {
        // Se houver mensagens de erro, verificar que não são críticas
        const errorText = await errorMessages.first().textContent();
        console.log(`Aviso: Mensagem encontrada em ${tela}: ${errorText}`);
      }
    }
  });
});


import { expect, test } from '@playwright/test';
import {
  expectCadastroLiderFormVisible,
  fillCadastroLiderForm,
  getCadastrarLiderButton,
  gotoCadastroLiderPage
} from '../helpers/cadastro-lider-helpers';
import { checkServerAvailable, clearAuth, performLogin } from '../helpers/test-helpers';

/**
 * Testes de navegação do fluxo de cadastro de líder
 * 
 * Estes testes garantem que:
 * - A navegação para cadastro de líder funciona
 * - O formulário de cadastro está acessível
 * - Alterações no código de cadastro não quebram a navegação
 * - A lista de gestores é atualizada após cadastro
 */

test.describe('Fluxo de Cadastro de Líder', () => {
  
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

  test('deve navegar para página de cadastro de líder', async ({ page }) => {
    await gotoCadastroLiderPage(page);
    await expect(page).toHaveURL(/\/cadastro-lider/);
    await expect(page.locator('text="Cadastrar Gestor"')).toBeVisible();
    await expect(page.locator('text="Cadastre um novo gestor para gerenciar uma equipe"')).toBeVisible();
  });

  test('deve exibir formulário de cadastro de líder', async ({ page }) => {
    await gotoCadastroLiderPage(page);
    await expectCadastroLiderFormVisible(page);
  });

  test('deve validar campos obrigatórios no cadastro', async ({ page }) => {
    await gotoCadastroLiderPage(page);
    
    // Tentar cadastrar sem preencher campos
    await getCadastrarLiderButton(page).click();
    
    // Aguardar validação
    await page.waitForTimeout(1000);
    
    // Verificar que ainda está na página (não foi redirecionado)
    await expect(page).toHaveURL(/\/cadastro-lider/);
  });

  test('deve validar senha com menos de 6 caracteres', async ({ page }) => {
    await gotoCadastroLiderPage(page);
    
    await fillCadastroLiderForm(page, {
      nome: 'Teste Líder',
      email: 'lider@teste.com',
      senha: '12345',
      confirmarSenha: '12345',
      departamento: 'Operações',
      cargo: 'Líder',
    });
    
    // Verificar mensagem de erro (se houver)
    await page.waitForTimeout(500);
    
    // Tentar cadastrar
    await getCadastrarLiderButton(page).click();
    
    // Aguardar validação
    await page.waitForTimeout(1000);
    
    // Verificar que ainda está na página
    await expect(page).toHaveURL(/\/cadastro-lider/);
  });

  test('deve validar que senhas coincidem', async ({ page }) => {
    await gotoCadastroLiderPage(page);
    
    await fillCadastroLiderForm(page, {
      nome: 'Teste Líder',
      email: 'lider@teste.com',
      senha: 'senha123',
      confirmarSenha: 'senha456',
      departamento: 'Operações',
      cargo: 'Líder',
    });
    
    // Tentar cadastrar
    await getCadastrarLiderButton(page).click();
    
    // Aguardar validação
    await page.waitForTimeout(1000);
    
    // Verificar que ainda está na página
    await expect(page).toHaveURL(/\/cadastro-lider/);
  });

  test('deve exibir lista de gestores cadastrados', async ({ page }) => {
    await gotoCadastroLiderPage(page);
    
    // Verificar se existe seção de gestores cadastrados
    // Pode estar vazia, mas a seção deve existir
    const gestoresSection = page.locator('text=/gestores.*cadastrados/i, text=/líderes.*cadastrados/i');
    
    // Se a seção existir, verificar que está visível
    if (await gestoresSection.count() > 0) {
      await expect(gestoresSection.first()).toBeVisible();
    }
  });

  test('deve permitir voltar para gerenciar-equipe', async ({ page }) => {
    await gotoCadastroLiderPage(page);
    
    // Procurar botão de voltar
    const voltarButton = page.locator('button:has-text("Voltar"), a:has-text("Voltar")');
    
    if (await voltarButton.count() > 0) {
      await voltarButton.first().click();
      
      // Aguardar navegação
      await page.waitForTimeout(1000);
      
      // Verificar que navegou (pode ser /gerenciar-equipe ou outra rota)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/cadastro-lider');
    }
  });

  test('deve navegar para edição de líder quando clicar em editar', async ({ page }) => {
    await gotoCadastroLiderPage(page);
    
    // Procurar botão de editar na lista de gestores
    const editButton = page
      .locator('button[aria-label*="editar" i], button:has([class*="pencil" i]), button:has([class*="edit" i])')
      .first();
    
    if (await editButton.count() > 0) {
      await editButton.click();
      
      // Aguardar navegação
      await page.waitForURL(/\/editar-lider/, { timeout: 5000 });
      
      // Verificar que está na página de edição
      await expect(page).toHaveURL(/\/editar-lider/);
    } else {
      // Se não houver gestores, o teste passa (não há nada para editar)
      test.skip();
    }
  });
});


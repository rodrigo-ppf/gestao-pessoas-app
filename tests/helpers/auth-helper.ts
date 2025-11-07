import { Page } from '@playwright/test';

/**
 * Helper para autenticação nos testes
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Faz login com credenciais padrão
   */
  async login(email: string = 'admin@sistema.com', senha: string = 'admin123'): Promise<void> {
    await this.page.goto('/login');
    
    // Preencher formulário
    await this.page.fill('input[type="email"], input[placeholder*="email" i]', email);
    await this.page.fill('input[type="password"], input[placeholder*="senha" i]', senha);
    
    // Clicar no botão de login
    const loginButton = this.page.locator('button:has-text("Entrar no Sistema"), button:has-text("Entrar")');
    await loginButton.click();
    
    // Aguardar redirecionamento
    await this.page.waitForURL(/\/home/, { timeout: 10000 });
  }

  /**
   * Limpa autenticação
   */
  async logout(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Verifica se está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const currentUrl = this.page.url();
    return !currentUrl.includes('/login');
  }
}



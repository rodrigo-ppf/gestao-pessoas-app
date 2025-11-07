import { Page } from '@playwright/test';

/**
 * Helper para verificar se o servidor está disponível
 */
export async function checkServerAvailable(page: Page, baseURL: string = 'http://localhost:8081'): Promise<boolean> {
  try {
    const response = await page.goto(baseURL, { timeout: 5000, waitUntil: 'domcontentloaded' });
    return response?.status() !== undefined && response.status() < 500;
  } catch (error) {
    return false;
  }
}

/**
 * Helper para fazer login de forma reutilizável
 */
export async function performLogin(
  page: Page,
  email: string = 'admin@sistema.com',
  senha: string = 'admin123'
): Promise<boolean> {
  const dialogHandler = async (dialog: any) => {
    try {
      console.log('Dialog detectado durante login:', dialog.message());
      await dialog.dismiss();
    } catch (error) {
      console.error('Erro ao descartar dialog:', error);
    }
  };

  page.on('dialog', dialogHandler);

  try {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000); // Aguardar React renderizar
    
    // Verificar se realmente está na página de login
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      console.error('Não está na página de login. URL atual:', currentUrl);
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
    }
    
    // Tentar usar o botão de "Login Admin Rápido" se disponível (mais confiável)
    try {
      const quickLoginButton = page.locator('button:has-text("Login Admin Rápido"), button:has-text("Admin Rápido")').first();
      const quickLoginVisible = await quickLoginButton.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (quickLoginVisible) {
        console.log('Usando botão de Login Admin Rápido');
        await quickLoginButton.click();
        await page.waitForTimeout(2000);
        
        // Aguardar redirecionamento
        try {
          await page.waitForURL(/\/(home|selecionar-empresa)/, { timeout: 20000 });
          return true;
        } catch {
          await page.waitForTimeout(3000);
          const url = page.url();
          return url.includes('/home') || url.includes('/selecionar-empresa');
        }
      }
    } catch (error) {
      // Continuar com método normal se não encontrar o botão rápido
      console.log('Botão rápido não encontrado, usando método normal');
    }
    
    // Usar seletores mais diretos baseados no snapshot da página
    // Os inputs têm placeholder "Digite seu email" e "Digite sua senha"
    const emailInput = page.locator('textbox[placeholder*="email" i], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('textbox[placeholder*="senha" i], input[placeholder*="senha" i], input[type="password"]').first();
    
    // Aguardar inputs aparecerem
    try {
      await emailInput.waitFor({ state: 'visible', timeout: 10000 });
      await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      console.error('Inputs não apareceram:', error);
      return false;
    }
    
    // Preencher email
    try {
      await emailInput.scrollIntoViewIfNeeded();
      await emailInput.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(200);
      
      // Limpar e preencher
      await emailInput.clear();
      await emailInput.fill(email);
      await page.waitForTimeout(300);
      
      // Verificar se foi preenchido
      const emailValue = await emailInput.inputValue().catch(() => '');
      if (emailValue !== email) {
        console.log(`Email não foi preenchido corretamente. Esperado: ${email}, Obtido: ${emailValue}`);
        await emailInput.fill(email);
        await page.waitForTimeout(300);
      }
    } catch (error) {
      console.error('Erro ao preencher email:', error);
      return false;
    }
    
    // Preencher senha
    try {
      await passwordInput.scrollIntoViewIfNeeded();
      await passwordInput.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(200);
      
      // Limpar e preencher
      await passwordInput.clear();
      await passwordInput.fill(senha);
      await page.waitForTimeout(300);
      
      // Verificar se foi preenchido (não podemos ver o valor de password, mas podemos verificar o length)
      const passwordLength = (await passwordInput.inputValue().catch(() => '')).length;
      if (passwordLength === 0) {
        console.log('Senha não foi preenchida, tentando novamente...');
        await passwordInput.fill(senha);
        await page.waitForTimeout(300);
      }
    } catch (error) {
      console.error('Erro ao preencher senha:', error);
      return false;
    }
    
    // Procurar botão de login - usar seletor direto baseado no snapshot
    const loginButton = page.locator('button:has-text("Entrar no Sistema")').first();
    
    try {
      await loginButton.waitFor({ state: 'visible', timeout: 10000 });
      await loginButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      // Verificar se o botão está habilitado
      const isDisabled = await loginButton.isDisabled().catch(() => false);
      if (isDisabled) {
        console.log('Botão de login está desabilitado, aguardando validação...');
        await page.waitForTimeout(2000);
        const stillDisabled = await loginButton.isDisabled().catch(() => false);
        if (stillDisabled) {
          console.error('Botão ainda desabilitado após aguardar');
          // Verificar valores dos campos
          const emailVal = await emailInput.inputValue().catch(() => '');
          const passVal = (await passwordInput.inputValue().catch(() => '')).length;
          console.log(`Email: ${emailVal}, Senha length: ${passVal}`);
          return false;
        }
      }
      
      // Clicar no botão - tentar múltiplas abordagens
      console.log('Clicando no botão de login...');
      
      // Verificar se há erros no console antes de clicar
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Tentar disparar o evento diretamente via JavaScript (React Native Paper pode não responder bem ao click)
      const clickWorked = await page.evaluate((buttonText) => {
        // Encontrar o botão pelo texto
        const buttons = Array.from(document.querySelectorAll('button'));
        const button = buttons.find(btn => btn.textContent?.includes(buttonText));
        
        if (button) {
          // Tentar disparar o evento onPress diretamente
          const reactFiber = (button as any)._reactInternalFiber || (button as any)._reactInternalInstance;
          if (reactFiber) {
            // Tentar encontrar o handler
            let handler = null;
            let node = reactFiber;
            while (node && !handler) {
              if (node.memoizedProps?.onPress) {
                handler = node.memoizedProps.onPress;
                break;
              }
              node = node.return;
            }
            if (handler) {
              handler();
              return true;
            }
          }
          
          // Fallback: tentar click normal
          button.click();
          return true;
        }
        return false;
      }, 'Entrar no Sistema').catch(() => false);
      
      if (!clickWorked) {
        // Se o método JavaScript não funcionou, tentar clique normal
        try {
          await loginButton.click();
        } catch (e) {
          console.log('Tentando clique alternativo...');
          await loginButton.click({ force: true });
        }
      }
      
      // Aguardar o clique processar e o login acontecer
      await page.waitForTimeout(3000);
      
      // Verificar se houve erros no console
      if (consoleErrors.length > 0) {
        console.log('Erros no console:', consoleErrors);
      }
      
      // Verificar se o login foi bem-sucedido verificando o localStorage
      let loginSuccess = await page.evaluate(() => {
        return !!localStorage.getItem('userId');
      });
      
      if (!loginSuccess) {
        console.log('Login não foi bem-sucedido na primeira verificação, aguardando...');
        // Aguardar mais um pouco e verificar novamente (o login pode ser assíncrono)
        for (let i = 0; i < 10; i++) {
          await page.waitForTimeout(500);
          loginSuccess = await page.evaluate(() => {
            return !!localStorage.getItem('userId');
          });
          if (loginSuccess) {
            console.log(`Login bem-sucedido após ${(i + 1) * 500}ms`);
            break;
          }
        }
        
        if (!loginSuccess) {
          console.error('Login falhou - userId não encontrado no localStorage após múltiplas tentativas');
          // Verificar se há mensagem de erro
          const errorText = await page.locator('text=/erro/i, text=/inválid/i, text=/incorreto/i').first().textContent().catch(() => '');
          if (errorText) {
            console.error(`Mensagem de erro encontrada: ${errorText}`);
          }
          return false;
        }
      } else {
        console.log('Login bem-sucedido - userId encontrado no localStorage');
      }
    } catch (error) {
      console.error('Erro ao clicar no botão de login:', error);
      return false;
    }
    
    // Aguardar redirecionamento - o router.push() usa setTimeout de 100ms
    // Aguardar até 15 segundos para o redirecionamento acontecer
    let redirected = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(500);
      
      try {
        const currentUrl = page.url();
        
        // Verificar se redirecionou
        if (currentUrl.includes('/home') || currentUrl.includes('/selecionar-empresa')) {
          redirected = true;
          break;
        }
        
        // Se ainda está em /login, verificar se há erro
        if (currentUrl.includes('/login') && i > 10) {
          // Verificar se há mensagem de erro
          const errorVisible = await page.locator('text=/erro/i, text=/inválid/i, text=/incorreto/i').first().isVisible().catch(() => false);
          if (errorVisible) {
            console.log('Mensagem de erro detectada - credenciais inválidas');
            return false;
          }
        }
      } catch (e) {
        // Continuar tentando
      }
    }
    
    if (redirected) {
      return true;
    }
    
    // Última verificação: verificar URL atual e localStorage
    try {
      const currentUrl = page.url();
      const hasUserId = await page.evaluate(() => {
        return !!localStorage.getItem('userId');
      });
      
      if (hasUserId && (currentUrl.includes('/home') || currentUrl.includes('/selecionar-empresa'))) {
        return true;
      }
      
      if (hasUserId && !currentUrl.includes('/login')) {
        // Login foi bem-sucedido mas não redirecionou ainda
        console.log('Login bem-sucedido mas redirecionamento pendente');
        return true;
      }
      
      return false;
    } catch (e) {
      return false;
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return false;
  } finally {
    page.off('dialog', dialogHandler);
  }
}

/**
 * Helper para cadastrar uma empresa e criar um usuário responsável
 */
export async function registerCompanyAndUser(
  page: Page,
  empresaData: {
    nome: string;
    codigo: string;
    cnpj: string;
    endereco: string;
    telefone: string;
  },
  responsavelData: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
  }
): Promise<{ success: boolean; email?: string; senha?: string }> {
  const dialogMessages: string[] = [];
  const consoleErrors: string[] = [];

  const dialogHandler = async (dialog: any) => {
    try {
      dialogMessages.push(dialog.message());
      await dialog.dismiss();
    } catch (error) {
      console.error('Erro ao descartar dialog durante cadastro:', error);
    }
  };

  const consoleHandler = (msg: any) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  };

  page.on('dialog', dialogHandler);
  page.on('console', consoleHandler);

  try {
    await page.goto('/cadastro-empresa', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const controls = page.locator('[data-testid="text-input-outlined"]');

    const fillControl = async (index: number, value: string) => {
      const control = controls.nth(index);
      await control.waitFor({ state: 'visible', timeout: 10000 });
      await control.scrollIntoViewIfNeeded().catch(() => {});
      await control.fill('');
      await control.fill(value);
      await page.waitForTimeout(200);
    };

    // Preencher dados da empresa
    await fillControl(0, empresaData.nome);      // Nome da Empresa
    await fillControl(1, empresaData.codigo);   // Código da Empresa
    await fillControl(2, empresaData.cnpj);     // CNPJ
    await fillControl(3, empresaData.endereco); // Endereço (textarea)
    await fillControl(4, empresaData.telefone); // Telefone

    // Preencher dados do responsável
    await fillControl(5, responsavelData.nome);   // Nome do Responsável
    await fillControl(6, responsavelData.email);  // Email
    await fillControl(7, responsavelData.senha);  // Senha
    await fillControl(8, responsavelData.senha);  // Confirmar Senha
    await fillControl(9, responsavelData.telefone); // Telefone do responsável

    // Clicar no botão de cadastrar
    const cadastrarButton = page
      .locator('[role="button"][data-testid="button"]:has-text("Criar Conta")')
      .first();
    await cadastrarButton.waitFor({ state: 'visible', timeout: 10000 });
    await cadastrarButton.click();

    // Aguardar o cadastro processar - pode redirecionar para /verificar-email
    let redirected = false;
    try {
      await page.waitForURL(/\/(verificar-email|login|home)/, { timeout: 15000 });
      redirected = true;
    } catch (error) {
      // Permaneceremos na página atual, continuar verificações abaixo
    }

    await page.waitForTimeout(2000);

    // Verificar diferentes sinais de sucesso
    const currentUrl = page.url();
    const verificationEmail = await page
      .evaluate(() => localStorage.getItem('emailVerificacao'))
      .catch(() => null);
    const hasSuccessMessage = await page
      .locator('text=/verificação/i, text=/sucesso/i, text=/cadastrado/i')
      .first()
      .isVisible()
      .catch(() => false);

    if (
      redirected &&
      (currentUrl.includes('/verificar-email') || currentUrl.includes('/login') || currentUrl.includes('/home'))
    ) {
      return {
        success: true,
        email: responsavelData.email,
        senha: responsavelData.senha,
      };
    }

    if (currentUrl.includes('/verificar-email')) {
      return {
        success: true,
        email: responsavelData.email,
        senha: responsavelData.senha,
      };
    }

    if (verificationEmail && verificationEmail === responsavelData.email) {
      return {
        success: true,
        email: responsavelData.email,
        senha: responsavelData.senha,
      };
    }

    if (hasSuccessMessage) {
      return {
        success: true,
        email: responsavelData.email,
        senha: responsavelData.senha,
      };
    }

    if (dialogMessages.length > 0) {
      console.error('Alertas exibidos durante cadastro:', dialogMessages);
    }

    if (consoleErrors.length > 0) {
      console.error('Erros de console durante cadastro:', consoleErrors);
    }

    // Capturar mensagens de validação visíveis
    const validationMessages = await page
      .evaluate(() =>
        Array.from(document.querySelectorAll('div, span, p'))
          .map(el => el.textContent?.trim())
          .filter(text => text && /obrigat.rio|erro|inv.lid/i.test(text))
      )
      .catch(() => [] as string[]);

    if (validationMessages.length > 0) {
      console.error('Mensagens de validação encontradas:', validationMessages);
    }

    console.error('Cadastro da empresa não confirmou sucesso. URL atual:', currentUrl);

    return { success: false };
  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error);
    return { success: false };
  } finally {
    page.off('dialog', dialogHandler);
    page.off('console', consoleHandler);
  }
}

/**
 * Helper para limpar autenticação
 */
export async function clearAuth(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    // Ignorar erros se não houver localStorage
  }
}


import { expect, type Page, type Locator } from '@playwright/test';

export type CadastroLiderFormData = {
  nome?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  departamento?: string;
  cargo?: string;
};

const CADASTRO_LIDER_INPUT_SELECTOR = '[data-testid="text-input-outlined"]';

export const getCadastroLiderInputs = (page: Page): Locator => {
  return page.locator(CADASTRO_LIDER_INPUT_SELECTOR);
};

export const gotoCadastroLiderPage = async (page: Page): Promise<void> => {
  await page.goto('/cadastro-lider', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(1_000);
};

export const expectCadastroLiderFormVisible = async (page: Page): Promise<void> => {
  const inputs = getCadastroLiderInputs(page);
  const inputCount = await inputs.count();
  expect(inputCount).toBeGreaterThanOrEqual(6);
  await expect(inputs.nth(0)).toBeVisible(); // Nome
  await expect(inputs.nth(1)).toBeVisible(); // Email
  await expect(inputs.nth(2)).toBeVisible(); // Senha
  await expect(inputs.nth(3)).toBeVisible(); // Confirmar senha
  await expect(inputs.nth(4)).toBeVisible(); // Departamento
  await expect(inputs.nth(5)).toBeVisible(); // Cargo
  await expect(page.locator('text="Cadastrar Gestor"')).toBeVisible();
};

export const fillCadastroLiderForm = async (
  page: Page,
  {
    nome,
    email,
    senha,
    confirmarSenha,
    departamento,
    cargo,
  }: CadastroLiderFormData
): Promise<void> => {
  const inputs = getCadastroLiderInputs(page);

  if (nome !== undefined) {
    await inputs.nth(0).fill(nome);
  }

  if (email !== undefined) {
    await inputs.nth(1).fill(email);
  }

  if (senha !== undefined) {
    await inputs.nth(2).fill(senha);
  }

  if (confirmarSenha !== undefined) {
    await inputs.nth(3).fill(confirmarSenha);
  }

  if (departamento !== undefined) {
    await inputs.nth(4).fill(departamento);
  }

  if (cargo !== undefined) {
    await inputs.nth(5).fill(cargo);
  }
};

export const getCadastrarLiderButton = (page: Page): Locator => {
  return page.locator('button:has-text("Cadastrar Líder"), button:has-text("Cadastrar")').first();
};



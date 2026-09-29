import { test, expect, type Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/')
  await page.getByLabel('Usuário', { exact: true }).fill('e2e')
  await page.getByLabel('Senha', { exact: true }).fill('Browser-test-password-947!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Olá, Alex.' })).toBeVisible()
}

test('protected routes and invalid credentials', async ({ page }) => {
  await page.goto('/registros')
  await expect(page).toHaveURL(/entrar/)
  await page.getByLabel('Usuário', { exact: true }).fill('e2e')
  await page.getByLabel('Senha', { exact: true }).fill('incorrect')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Usuário ou senha inválidos')
})

test('desktop: persistent CRUD, search, activity, profile, theme, logout', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 1100 })
  await login(page)
  await expect(page.getByRole('link', { name: /Planejamento do novo projeto/ })).toBeVisible()
  await page.screenshot({ path: '../.artifacts/dashboard-desktop.png', fullPage: true })
  await page.getByRole('button', { name: 'Recolher menu', exact: true }).click()
  await page.getByRole('button', { name: 'Expandir menu', exact: true }).click()
  await page.getByRole('link', { name: 'Novo registro', exact: true }).click()
  await page.getByLabel('Nome do registro').fill('Registro de validação')
  await page.getByLabel('Categoria', { exact: true }).fill('Teste')
  await page.getByRole('combobox').selectOption('active')
  await page.getByLabel('Observações').fill('Dados realmente persistidos no banco.')
  await page.getByRole('button', { name: 'Salvar registro' }).click()
  await expect(page.getByRole('link', { name: 'Registro de validação', exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('link', { name: 'Registro de validação', exact: true }).click()
  await expect(page.getByLabel('Observações')).toHaveValue('Dados realmente persistidos no banco.')
  await page.getByLabel('Nome do registro').fill('Registro revisado')
  await page.getByRole('button', { name: 'Salvar registro' }).click()
  await page.getByLabel('Buscar registros').fill('revisado')
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Registro revisado', exact: true })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Planejamento do novo projeto', exact: true }),
  ).toHaveCount(0)
  await page.getByRole('link', { name: 'Registro revisado', exact: true }).click()
  await page.getByRole('button', { name: 'Excluir registro', exact: true }).click()
  await page.getByRole('button', { name: 'Confirmar exclusão' }).click()
  await expect(page).toHaveURL(/\/registros$/)
  await expect(page.getByRole('link', { name: 'Registro revisado', exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: 'Atividade', exact: true }).click()
  await expect(page.getByText('Você excluiu')).toBeVisible()
  await page.getByRole('link', { name: 'Configurações', exact: true }).click()
  await page.getByLabel('Sobrenome', { exact: true }).fill('Teste')
  await page.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(page.getByRole('status')).toContainText('Perfil atualizado')
  await page.getByRole('button', { name: 'Escuro', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByLabel('Sobrenome', { exact: true })).toHaveValue('Teste')
  await page.getByRole('button', { name: 'Claro', exact: true }).click()
  await page.getByRole('link', { name: 'Usuários', exact: true }).click()
  await expect(page.getByRole('cell', { name: 'Administrador' })).toBeVisible()
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(page).toHaveURL(/entrar/)
  expect(errors).toEqual([])
})

test('mobile: responsive navigation and record form', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page)
  await expect(page.getByRole('link', { name: /Planejamento do novo projeto/ })).toBeVisible()
  await page.screenshot({ path: '../.artifacts/dashboard-mobile.png', fullPage: true })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await page.getByRole('link', { name: 'Registros', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Seus registros.' })).toBeVisible()
  await page.getByRole('link', { name: 'Novo registro', exact: true }).click()
  await expect(page.getByLabel('Nome do registro')).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
})

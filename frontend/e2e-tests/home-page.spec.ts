import { test, expect } from '@playwright/test';

test('should display the home page with key metrics', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Check that the page title is correct
  await expect(page).toHaveTitle(/Portal de Transparencia/);
  
  // Check that key elements are present
  await expect(page.getByText('Portal de Transparencia Integrado')).toBeVisible();
  await expect(page.getByText('Carmen de Areco')).toBeVisible();
  
  // Check that metrics are displayed
  await expect(page.getByText('Documentos Totales')).toBeVisible();
  await expect(page.getByText('Verificados')).toBeVisible();
  await expect(page.getByText('Transparencia')).toBeVisible();
  await expect(page.getByText('Presupuesto')).toBeVisible();
});

test('should navigate to the budget page and display budget information', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Click on the budget link in the sidebar
  await page.click('text=💰 Presupuesto');
  
  // Check that we're on the budget page
  await expect(page).toHaveURL(/.*budget/);
  
  // Check that budget elements are present
  await expect(page.getByText('Presupuesto Municipal Integral')).toBeVisible();
  await expect(page.getByText('Carmen de Areco')).toBeVisible();
  
  // Check that metrics are displayed
  await expect(page.getByText('Presupuesto Total')).toBeVisible();
  await expect(page.getByText('Ejecutado')).toBeVisible();
  await expect(page.getByText('Índice Transparencia')).toBeVisible();
});

test('should navigate to the contracts page and display contract information', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Click on the contracts link in the sidebar
  await page.click('text=📋 Contratos');
  
  // Check that we're on the contracts page
  await expect(page).toHaveURL(/.*contracts/);
  
  // Check that contracts elements are present
  await expect(page.getByText('Contratos y Licitaciones')).toBeVisible();
  await expect(page.getByText('Carmen de Areco')).toBeVisible();
  
  // Check that metrics are displayed
  await expect(page.getByText('Total de Contratos')).toBeVisible();
  await expect(page.getByText('Monto Total')).toBeVisible();
  await expect(page.getByText('Tasa de Finalización')).toBeVisible();
});

test('should navigate to the salaries page and display salary information', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Click on the salaries link in the sidebar
  await page.click('text=👥 Salarios');
  
  // Check that we're on the salaries page
  await expect(page).toHaveURL(/.*salaries/);
  
  // Check that salaries elements are present
  await expect(page.getByText('Nómina Municipal')).toBeVisible();
  await expect(page.getByText('Carmen de Areco')).toBeVisible();
  
  // Check that metrics are displayed
  await expect(page.getByText('Funcionarios Monitoreados')).toBeVisible();
  await expect(page.getByText('Declaraciones Presentadas')).toBeVisible();
  await expect(page.getByText('Pendientes/Tardías')).toBeVisible();
});
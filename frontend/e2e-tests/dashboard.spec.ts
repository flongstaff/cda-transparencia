import { test, expect } from '@playwright/test';

test('should display the dashboard page with integrated financial data', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard');
  
  // Check that we're on the dashboard page
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Check that the dashboard header is present
  await expect(page.getByText('Panel de Control Financiero')).toBeVisible();
  await expect(page.getByText('Visión integral de la situación financiera de Carmen de Areco')).toBeVisible();
  
  // Check that key metrics are displayed
  await expect(page.getByText('Presupuesto Total')).toBeVisible();
  await expect(page.getByText('Ejecución Presupuestaria')).toBeVisible();
  await expect(page.getByText('Deuda Total')).toBeVisible();
  await expect(page.getByText('Gastos en Salarios')).toBeVisible();
  await expect(page.getByText('Contratos Públicos')).toBeVisible();
  await expect(page.getByText('Documentos Verificados')).toBeVisible();
  
  // Check that financial ratios section is present
  await expect(page.getByText('Ratios Financieros Clave')).toBeVisible();
  await expect(page.getByText('Resumen de Actividades')).toBeVisible();
  
  // Check that system status indicator is present
  await expect(page.getByText('Sistema de Transparencia Activo')).toBeVisible();
});
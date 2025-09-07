import { test, expect } from '@playwright/test';

test('should display the documents page with categorized documents', async ({ page }) => {
  await page.goto('http://localhost:5173/documents');
  
  // Check that we're on the documents page
  await expect(page).toHaveURL(/.*documents/);
  
  // Check that documents header is present
  await expect(page.getByText('Documentos de Transparencia')).toBeVisible();
  await expect(page.getByText('Sistema integral de gestión y análisis documental municipal')).toBeVisible();
  
  // Check that document categories are displayed
  await expect(page.getByText('Documentos por Categoría')).toBeVisible();
  await expect(page.getByText('Ejecución Presupuestaria')).toBeVisible();
  await expect(page.getByText('Documentos Generales')).toBeVisible();
  await expect(page.getByText('Estados Financieros')).toBeVisible();
  await expect(page.getByText('Recursos Humanos')).toBeVisible();
  
  // Check that document count is displayed
  await expect(page.getByText('Mostrando')).toBeVisible();
  
  // Check that search functionality is present
  await expect(page.getByPlaceholder('Buscar documentos...')).toBeVisible();
  
  // Check that year selector is present
  await expect(page.getByText('Año')).toBeVisible();
  
  // Check that tabs are present
  await expect(page.getByText('Resumen General')).toBeVisible();
  await expect(page.getByText('Por Categorías')).toBeVisible();
  await expect(page.getByText('Análisis')).toBeVisible();
  await expect(page.getByText('Tendencias')).toBeVisible();
  await expect(page.getByText('Verificación')).toBeVisible();
  await expect(page.getByText('Explorador')).toBeVisible();
});
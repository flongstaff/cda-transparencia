import time, os
from scrapy import Spider
from scrapy_selenium import SeleniumRequest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class PowerBISpider(Spider):
    name = 'powerbi'
    allowed_domains = ['app.powerbi.com']
    # Lista de dashboards a procesar (ajusta según tus URLs)
    start_urls = [
        "https://app.powerbi.com/view?r=eyJrIjoiYzhjNWNhNmItOWY5Zi00OWExLTliMzAtMjYxZTM0NjM1Y2Y2IiwidCI6Ijk3MDQwMmVmLWNhZGMtNDcyOC05MjI2LTk3ZGRlODY4ZDg2ZCIsImMiOjR9&pageName=ReportSection",
        "https://app.powerbi.com/view?r=eyJrIjoiYzhjNWNhNmItOWY5Zi00OWExLTliMzAtMjYxZTM0NjM1Y2Y2IiwidCI6Ijk3MDQwMmVmLWNhZGMtNDcyOC05MjI2LTk3ZGRlODY4ZDg2ZCIsImCiOjR9&pageName=ReportSectiona1e9bc8a7074064c2b30",
        # ... agrega las demás URLs aquí
    ]
    
    custom_settings = {
        # Define una carpeta para guardar capturas
        'FILES_STORE': os.path.abspath("descargas_powerbi")
    }

    def start_requests(self):
        for url in self.start_urls:
            yield SeleniumRequest(
                url=url,
                callback=self.parse_dashboard,
                wait_time=30  # tiempo máximo de espera en segundos
            )

    def parse_dashboard(self, response):
        driver = response.meta['driver']
        self.logger.info(f"Procesando dashboard: {response.url}")

        # Espera extra para asegurar que el dashboard se renderice
        time.sleep(20)

        # (Opcional) Cierra banner de cookies si existe
        try:
            cookie_btn = driver.find_element(By.XPATH, "//button[contains(., 'Aceptar')]")
            cookie_btn.click()
            self.logger.info("Cerrado banner de cookies")
        except Exception:
            self.logger.info("No se detectó banner de cookies.")

        # (Opcional) Clic en botón "Ver más" para expandir datos ocultos
        try:
            ver_mas_btn = driver.find_element(By.XPATH, "//button[contains(., 'Ver más')]")
            ver_mas_btn.click()
            self.logger.info("Clickeado 'Ver más'")
            time.sleep(10)
        except Exception:
            self.logger.info("No se encontró botón 'Ver más'")

        # Intentamos clicar el botón "Exportar datos" para exportar la tabla (si está habilitado)
        try:
            export_btn = driver.find_element(By.XPATH, "//button[contains(., 'Exportar datos')]")
            export_btn.click()
            self.logger.info("Clickeado 'Exportar datos'")
            time.sleep(30)  # tiempo para que se inicie/complete la descarga
        except Exception as e:
            self.logger.info(f"No se pudo clicar 'Exportar datos': {e}")

        # Tomar captura de pantalla del dashboard "completo"
        screenshot = driver.get_screenshot_as_png()
        dashboard_index = self.start_urls.index(response.url) + 1
        screenshot_file = os.path.join(response.meta.get("FILES_STORE", os.getcwd()), f"dashboard_{dashboard_index}.png")
        with open(screenshot_file, "wb") as f:
            f.write(screenshot)
        self.logger.info(f"Captura guardada en: {screenshot_file}")

        # Aquí podrías agregar lógica para extraer datos extra (si la página los deja en el HTML)

        yield {"dashboard_url": response.url, "screenshot": screenshot_file}

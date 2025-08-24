import scrapy
from urllib.parse import urljoin

class TransparenciaSpider(scrapy.Spider):
    name = 'transparencia'
    allowed_domains = ['carmendeareco.gob.ar']
    start_urls = ['https://carmendeareco.gob.ar/transparencia/']

    # Extensiones de interés
    file_extensions = ('.pdf', '.xls', '.xlsx')

    def parse(self, response):
        for href in response.css('a::attr(href)').getall():
            if href.lower().endswith(self.file_extensions):
                full_url = urljoin(response.url, href)
                self.logger.info(f"Encontrado: {full_url}")
                yield {'file_urls': [full_url]}

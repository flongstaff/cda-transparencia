#!/usr/bin/env python3
"""
Test script to verify all external services for Carmen de Areco Transparency Portal
"""
import requests
import json
import time
from urllib.parse import urljoin
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Set a timeout for requests
TIMEOUT = 10

class ExternalServicesTester:
    def __init__(self):
        self.results = {}
        self.session = requests.Session()
        # Set a user agent to avoid being blocked by some services
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def test_url(self, name, url, method='GET', payload=None, expected_status=200):
        """Test a URL and return response info"""
        logger.info(f"Testing {name}: {url}")
        try:
            if method == 'GET':
                response = self.session.get(url, timeout=TIMEOUT)
            elif method == 'POST':
                response = self.session.post(url, json=payload, timeout=TIMEOUT)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            success = response.status_code == expected_status
            result = {
                'name': name,
                'url': url,
                'method': method,
                'status_code': response.status_code,
                'success': success,
                'response_time': response.elapsed.total_seconds(),
                'content_type': response.headers.get('content-type', 'unknown')
            }
            
            if success:
                logger.info(f"✓ {name} - Status: {response.status_code}")
            else:
                logger.warning(f"✗ {name} - Expected {expected_status}, got {response.status_code}")
                
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ {name} - Error: {str(e)}")
            return {
                'name': name,
                'url': url,
                'method': method,
                'success': False,
                'error': str(e)
            }

    def test_api_endpoint(self, name, url, params=None, expected_keys=None):
        """Test an API endpoint and check for expected keys in response"""
        logger.info(f"Testing API {name}: {url}")
        try:
            response = self.session.get(url, params=params, timeout=TIMEOUT)
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Check if expected keys exist in response
                    if expected_keys:
                        missing_keys = [key for key in expected_keys if key not in data]
                        success = len(missing_keys) == 0
                        result = {
                            'name': name,
                            'url': url,
                            'status_code': response.status_code,
                            'success': success,
                            'response_time': response.elapsed.total_seconds(),
                            'missing_keys': missing_keys if not success else None
                        }
                        if success:
                            logger.info(f"✓ {name} - API working, required keys present")
                        else:
                            logger.warning(f"✗ {name} - Missing expected keys: {missing_keys}")
                    else:
                        result = {
                            'name': name,
                            'url': url,
                            'status_code': response.status_code,
                            'success': True,
                            'response_time': response.elapsed.total_seconds(),
                            'data_sample': str(data)[:200]  # First 200 chars as sample
                        }
                        logger.info(f"✓ {name} - API working, response sample: {str(data)[:100]}...")
                except json.JSONDecodeError:
                    result = {
                        'name': name,
                        'url': url,
                        'status_code': response.status_code,
                        'success': False,
                        'error': 'Response is not valid JSON'
                    }
                    logger.error(f"✗ {name} - Response is not valid JSON")
            else:
                result = {
                    'name': name,
                    'url': url,
                    'status_code': response.status_code,
                    'success': False,
                    'error': f'HTTP {response.status_code}'
                }
                logger.error(f"✗ {name} - HTTP {response.status_code}")
                
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ {name} - Error: {str(e)}")
            return {
                'name': name,
                'url': url,
                'success': False,
                'error': str(e)
            }

    def run_tests(self):
        """Run all tests and return results"""
        logger.info("Starting external services tests...")
        
        # Test municipal level sources
        self.results['municipal'] = []
        municipal_sources = [
            ("Carmen de Areco Official Site", "https://carmendeareco.gob.ar/"),
            ("Carmen de Areco Transparency Portal", "https://carmendeareco.gob.ar/transparencia"),
            ("Carmen de Areco Official Bulletin", "https://carmendeareco.gob.ar/gobierno/boletin-oficial/"),
            ("Municipal Council Blog", "http://hcdcarmendeareco.blogspot.com/"),
        ]
        
        for name, url in municipal_sources:
            result = self.test_url(name, url)
            self.results['municipal'].append(result)
            time.sleep(0.5)  # Be respectful to servers

        # Test national level sources
        self.results['national'] = []
        national_sources = [
            ("National Open Data Portal", "https://datos.gob.ar/"),
            ("Carmen de Areco datasets", "https://datos.gob.ar/dataset?q=carmen+de+areco"),
            ("National Budget API", "https://datos.gob.ar/dataset/sspm-presupuesto-abierto"),
            ("National Contracts API", "https://datos.gob.ar/dataset/modernizacion-sistema-contrataciones-electronicas-argentina"),
            ("Ministry of Justice Open Data", "https://datos.jus.gob.ar/"),
            ("Anti-Corruption Office", "https://www.argentina.gob.ar/anticorrupcion"),
            ("Access to Information Law", "https://www.argentina.gob.ar/aaip"),
            ("InfoLEG Legal Database", "http://www.infoleg.gob.ar/"),
            ("Investment Map", "https://www.argentina.gob.ar/jefatura/innovacion-publica/mapa-inversiones"),
        ]
        
        for name, url in national_sources:
            result = self.test_url(name, url)
            self.results['national'].append(result)
            time.sleep(0.5)

        # Test provincial level sources
        self.results['provincial'] = []
        provincial_sources = [
            ("Provincial Open Data", "https://www.gba.gob.ar/datos_abiertos"),
            ("Provincial Fiscal Transparency", "https://www.gba.gob.ar/transparencia_fiscal/"),
            ("Provincial Municipalities Portal", "https://www.gba.gob.ar/municipios"),
            ("Provincial Procurement Portal", "https://pbac.cgp.gba.gov.ar/Default.aspx"),
            ("Provincial Contracts Search", "https://sistemas.gba.gob.ar/consulta/contrataciones/"),
        ]
        
        for name, url in provincial_sources:
            result = self.test_url(name, url)
            self.results['provincial'].append(result)
            time.sleep(0.5)

        # Test national API endpoints
        self.results['api'] = []
        
        # Test Geographic API
        result = self.test_api_endpoint(
            "Geographic API - Provinces", 
            "https://apis.datos.gob.ar/georef/api/provincias",
            expected_keys=['provincias', 'cantidad']
        )
        self.results['api'].append(result)
        
        # Test National Budget API (get a sample dataset)
        result = self.test_api_endpoint(
            "National Open Data Search API", 
            "https://datos.gob.ar/api/3/action/package_search",
            params={'q': 'carmen de areco', 'rows': 5}
        )
        self.results['api'].append(result)

        # Test transparency organizations
        self.results['organizations'] = []
        org_sources = [
            ("Poder Ciudadano", "https://poderciudadano.org/"),
            ("ACIJ", "https://acij.org.ar/"),
            ("Directorio Legislativo", "https://directoriolegislativo.org/"),
            ("Chequeado Projects", "https://chequeado.com/proyectos/"),
            ("La Nación Data", "https://www.lanacion.com.ar/data/"),
        ]
        
        for name, url in org_sources:
            result = self.test_url(name, url)
            self.results['organizations'].append(result)
            time.sleep(0.5)

        # Test similar municipalities
        self.results['similar_municipalities'] = []
        similar_muni_sources = [
            ("Chacabuco", "https://chacabuco.gob.ar/"),
            ("Chivilcoy", "https://chivilcoy.gob.ar/"),
            ("San Antonio de Areco", "https://www.sanantoniodeareco.gob.ar/"),
            ("San Andrés de Giles", "https://www.sag.gob.ar/"),
            ("Pergamino", "https://www.pergamino.gob.ar/"),
            ("Capitán Sarmiento", "https://capitansarmiento.gob.ar/"),
        ]
        
        for name, url in similar_muni_sources:
            result = self.test_url(name, url)
            self.results['similar_municipalities'].append(result)
            time.sleep(0.5)

        # Test best practice model municipalities
        self.results['best_practice_municipalities'] = []
        best_practice_sources = [
            ("Bahía Blanca Transparency", "https://transparencia.bahia.gob.ar/"),
            ("Mar del Plata Data", "https://www.mardelplata.gob.ar/datos-abiertos"),
            ("Pilar Open Data", "https://datosabiertos.pilar.gob.ar/"),
            ("San Isidro Transparency", "https://www.sanisidro.gob.ar/transparencia"),
            ("Rosario Open Government", "https://www.rosario.gob.ar/web/gobierno/gobierno-abierto"),
            ("Rafaela Open Government", "https://rafaela-gob-ar.github.io/"),
        ]
        
        for name, url in best_practice_sources:
            result = self.test_url(name, url)
            self.results['best_practice_municipalities'].append(result)
            time.sleep(0.5)

        logger.info("All tests completed.")
        return self.results

    def print_summary(self):
        """Print a summary of test results"""
        print("\n" + "="*60)
        print("EXTERNAL SERVICES TEST SUMMARY")
        print("="*60)
        
        for category, tests in self.results.items():
            print(f"\n{category.upper()} ({len(tests)} services tested):")
            print("-" * 40)
            
            successful = sum(1 for test in tests if test.get('success', False))
            total = len(tests)
            
            for test in tests:
                status = "✓" if test.get('success', False) else "✗"
                name = test.get('name', 'Unknown')
                print(f"  {status} {name}")
                
                if not test.get('success', False):
                    error = test.get('error', 'Unknown error')
                    print(f"      Error: {error}")
                    
            print(f"\n  Success rate: {successful}/{total} ({100*successful/total:.1f}%)")

def main():
    tester = ExternalServicesTester()
    results = tester.run_tests()
    tester.print_summary()
    
    # Save detailed results to a JSON file
    with open('external_services_test_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\nDetailed results saved to external_services_test_results.json")

if __name__ == "__main__":
    main()
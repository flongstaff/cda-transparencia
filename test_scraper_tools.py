#!/usr/bin/env python3
"""
Test script to verify scraper tools and monitoring services for Carmen de Areco Transparency Portal
"""
import requests
import json
import time
import subprocess
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Set a timeout for requests
TIMEOUT = 10

class ScraperToolsTester:
    def __init__(self):
        self.results = {}
        self.session = requests.Session()
        # Set a user agent to avoid being blocked by some services
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def test_github_repo(self, name, url):
        """Test if a GitHub repository exists and is accessible"""
        logger.info(f"Testing GitHub repo {name}: {url}")
        try:
            response = self.session.get(url, timeout=TIMEOUT)
            success = response.status_code == 200
            result = {
                'name': name,
                'url': url,
                'status_code': response.status_code,
                'success': success,
                'response_time': response.elapsed.total_seconds(),
            }
            
            if success:
                logger.info(f"✓ {name} - Repository accessible")
            else:
                logger.warning(f"✗ {name} - Status: {response.status_code}")
                
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ {name} - Error: {str(e)}")
            return {
                'name': name,
                'url': url,
                'success': False,
                'error': str(e)
            }

    def test_api_docs(self, name, url):
        """Test if API documentation exists and is accessible"""
        logger.info(f"Testing API docs {name}: {url}")
        try:
            response = self.session.get(url, timeout=TIMEOUT)
            success = response.status_code == 200
            result = {
                'name': name,
                'url': url,
                'status_code': response.status_code,
                'success': success,
                'response_time': response.elapsed.total_seconds(),
            }
            
            if success:
                logger.info(f"✓ {name} - API docs accessible")
            else:
                logger.warning(f"✗ {name} - Status: {response.status_code}")
                
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ {name} - Error: {str(e)}")
            return {
                'name': name,
                'url': url,
                'success': False,
                'error': str(e)
            }

    def check_python_module(self, module_name):
        """Check if a Python module is available"""
        try:
            __import__(module_name)
            return True
        except ImportError:
            return False

    def run_tests(self):
        """Run tests for scraper tools and monitoring services"""
        logger.info("Starting scraper tools and monitoring services tests...")
        
        # Test Argentine-specific scrapers
        self.results['argentine_scrapers'] = []
        scraper_repos = [
            ("BORA App", "https://github.com/juancarlospaco/borapp"),
            ("Official Gazette Scraper", "https://github.com/tommanzur/scraper_boletin_oficial"),
            ("Justice Ministry Scraper", "https://github.com/jorgechavez6816/minjus_reg_sociedades_argentina"),
            ("BCRA Analysis", "https://github.com/ezebinker/DatosAPI-BCRA"),
            ("SIBOM Bot", "https://github.com/nmontesoro/SIBOM"),
        ]
        
        for name, url in scraper_repos:
            result = self.test_github_repo(name, url)
            self.results['argentine_scrapers'].append(result)
            time.sleep(0.5)

        # Test monitoring tools
        self.results['monitoring_tools'] = []
        monitoring_repos = [
            ("Change Detection", "https://github.com/dgtlmoon/changedetection.io"),
            ("Wayback Machine API", "https://archive.org/help/wayback_api.php"),
            ("CrawlMonitor", "https://github.com/crawlmonitor/crawlmonitor"),
            ("WebScraper.io", "https://webscraper.io/"),
            ("IFTTT Monitoring", "https://ifttt.com/"),
        ]
        
        for name, url in monitoring_repos:
            result = self.test_github_repo(name, url) if "github.com" in url else self.test_api_docs(name, url)
            self.results['monitoring_tools'].append(result)
            time.sleep(0.5)

        # Test data processing tools
        self.results['data_processing_tools'] = []
        processing_repos = [
            ("PDFPlumber", "https://github.com/jsvine/pdfplumber"),
            ("Tabula-py", "https://github.com/chezou/tabula-py"),
            ("Budget Standardizer", "https://github.com/openspending/gobify"),
        ]
        
        for name, url in processing_repos:
            result = self.test_github_repo(name, url)
            self.results['data_processing_tools'].append(result)
            time.sleep(0.5)

        # Test verification tools
        self.results['verification_tools'] = []
        verification_tools = [
            ("Open Refine", "https://openrefine.org/"),
            ("CSVLint", "https://csvlint.io/"),
            ("Data Quality Tool", "https://github.com/frictionlessdata/goodtables-py"),
            ("Talend Open Studio", "https://www.talend.com/products/talend-open-studio/"),
        ]
        
        for name, url in verification_tools:
            result = self.test_github_repo(name, url) if "github.com" in url else self.test_api_docs(name, url)
            self.results['verification_tools'].append(result)
            time.sleep(0.5)

        # Test development tools
        self.results['development_tools'] = []
        dev_tools = [
            ("AfipSDK PHP", "https://github.com/AfipSDK/afip.php"),
            ("AfipSDK JS", "https://github.com/AfipSDK/afip.js"),
            ("PyAfipWs", "https://github.com/reingart/pyafipws"),
            ("Argentina.js", "https://github.com/seppo0010/argentina.js"),
            ("Civics API", "https://github.com/datosgobar/civics-apis-argentina"),
            ("Poncho Framework", "https://github.com/argob/poncho"),
        ]
        
        for name, url in dev_tools:
            result = self.test_github_repo(name, url)
            self.results['development_tools'].append(result)
            time.sleep(0.5)

        logger.info("All scraper and monitoring tool tests completed.")
        return self.results

    def print_summary(self):
        """Print a summary of test results"""
        print("\n" + "="*60)
        print("SCRAPER TOOLS & MONITORING SERVICES TEST SUMMARY")
        print("="*60)
        
        for category, tests in self.results.items():
            print(f"\n{category.upper()} ({len(tests)} tools tested):")
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
    tester = ScraperToolsTester()
    results = tester.run_tests()
    tester.print_summary()
    
    # Save detailed results to a JSON file
    with open('scraper_tools_test_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\nDetailed results saved to scraper_tools_test_results.json")

if __name__ == "__main__":
    main()
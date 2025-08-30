# data_extraction.py
"""
Functions for crawling the «transparencia» pages and downloading documents.
"""

import pathlib
import re
import sys
import time
import traceback
import requests
import asyncio
import urllib.parse
import aiohttp

from typing import Iterable, List
from bs4 import BeautifulSoup
import tqdm

# Global helpers
BASE_URL = "https://carmendeareco.gob.ar/transparencia/"

class RateLimitError(RuntimeError):  
    pass

async def retry_req(
        url: str,
        session: aiohttp.ClientSession,
        *,
        attempts: int = 5,
        backoff: float = 0.5,
) -> aiohttp.ClientResponse:
    """Async HTTP request with retry logic"""
    if attempts < 1:
        raise RuntimeError("invalid attempts")
    
    for n in range(attempts):
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                resp.raise_for_status()
                return resp
        except (aiohttp.ClientError, asyncio.TimeoutError) as err:
            if n >= attempts-1:
                raise
            # exponential backoff
            await asyncio.sleep(backoff * (2**n) + 0.1)

async def fetch_page(url: str, session: aiohttp.ClientSession) -> BeautifulSoup:
    """
    Return a BS4 soup for the page.
    """
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
        resp.raise_for_status()
        content = await resp.read()
        soup = BeautifulSoup(content, features="lxml")
        return soup


import pathlib
import re
import sys
import time
import traceback
import requests
import asyncio
import urllib.parse
import aiohttp

from typing import Iterable, List
from bs4 import BeautifulSoup
import tqdm
from carmen_transparencia.processing import process_directory

# Global helpers
BASE_URL = "https://carmendeareco.gob.ar/transparencia/"

class RateLimitError(RuntimeError):  
    pass

async def retry_req(
        url: str,
        session: aiohttp.ClientSession,
        *,
        attempts: int = 5,
        backoff: float = 0.5,
) -> aiohttp.ClientResponse:
    """Async HTTP request with retry logic"""
    if attempts < 1:
        raise RuntimeError("invalid attempts")
    
    for n in range(attempts):
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                resp.raise_for_status()
                return resp
        except (aiohttp.ClientError, asyncio.TimeoutError) as err:
            if n >= attempts-1:
                raise
            # exponential backoff
            await asyncio.sleep(backoff * (2**n) + 0.1)

async def fetch_page(url: str, session: aiohttp.ClientSession) -> BeautifulSoup:
    """
    Return a BS4 soup for the page.
    """
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
        resp.raise_for_status()
        content = await resp.read()
        soup = BeautifulSoup(content, features="lxml")
        return soup

async def _get_links(
        url: str,
        pattern: re.Pattern = re.compile(r'\.(pdf|xlsx|docx?|csv|xls)

# Public helpers
async def scrape_live(
        base_url: str = BASE_URL,
        output_dir: str = "data",
        depth: int = 1,
) -> List[tuple[str, pathlib.Path]]:
    """
    Scrape base_url and returns a list of (URL, Path) tuples.
    """
    out = pathlib.Path(output_dir).resolve()
    out.mkdir(parents=True, exist_ok=True)
    
    results = []
    
    async with aiohttp.ClientSession() as session:
        # Get all document links
        links = await _get_links(base_url, depth=depth, session=session)
        
        for url in tqdm.tqdm(links, desc="Downloading"):
            name = pathlib.Path(urllib.parse.urlparse(url).path).name
            if not name:
                name = f"document_{len(results)}.pdf"
            dest = out / name
            
            # Skip if file already exists
            if dest.exists():
                results.append((url, dest))
                continue
                
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                    resp.raise_for_status()
                    content = await resp.read()
                    
                    # Save file
                    with open(dest, "wb") as fh:
                        fh.write(content)
                    
                    results.append((url, dest))
                    
            except Exception as e:
                print(f"Error downloading {url}: {e}")
                
    return results

# Wayback machine scraping
WAYBACK_FMT = "https://web.archive.org/web/20231231212000id_/{path}"

async def scrape_wayback(
        base_url: str = BASE_URL,
        output_dir: str = "wayback",
        depth: int = 1,
) -> List[tuple[str, pathlib.Path]]:
    """
    Same as scrape_live but using Wayback machine.
    """
    out = pathlib.Path(output_dir).resolve()
    out.mkdir(parents=True, exist_ok=True)
    
    results = []
    
    async with aiohttp.ClientSession() as session:
        # Get original links first
        links = await _get_links(base_url, depth=depth, session=session)
        
        for url in tqdm.tqdm(links, desc="Downloading via Wayback"):
            url_path = urllib.parse.urlparse(url).path
            wayback_url = WAYBACK_FMT.format(path=url_path)
            
            name = pathlib.Path(url).name
            dest = out / name
            
            if dest.exists():
                results.append((url, dest))
                continue
                
            try:
                async with session.get(wayback_url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                    resp.raise_for_status()
                    content = await resp.read()
                    
                    with open(dest, "wb") as fh:
                        fh.write(content)
                    
                    results.append((url, dest))
                    
            except Exception as e:
                print(f"Error downloading {wayback_url}: {e}")
                
    return results

# Synchronous wrappers for CLI
def scrape_live_sync(**kwargs):
    """Synchronous wrapper for scrape_live"""
    return asyncio.run(scrape_live(**kwargs))

def scrape_wayback_sync(**kwargs):
    """Synchronous wrapper for scrape_wayback"""
    return asyncio.run(scrape_wayback(**kwargs)), re.I),
        *,
        depth: int = 1,
        session: aiohttp.ClientSession = None
) -> List[str]:
    """
    Return absolute list of URLs found on the page.
    """
    if session is None:
        async with aiohttp.ClientSession() as session:
            return await _get_links(url, pattern, depth=depth, session=session)
    
    soup = await fetch_page(url, session)
    
    seen: set = set()
    result: List[str] = []

    for a in soup.find_all("a", href=True):
        href = a["href"]
        absurl = urllib.parse.urljoin(url, href)
        
        # only internal URLs
        if not absurl.startswith("https://carmendeareco.gob.ar"):
            continue
            
        if pattern.search(href) and absurl not in seen:
            seen.add(absurl)
            result.append(absurl)
            
        # Recursive depth handling
        if depth > 1 and href.endswith('/') and absurl not in seen:
            seen.add(absurl)
            try:
                deeper_links = await _get_links(absurl, pattern, depth=depth-1, session=session)
                result.extend(deeper_links)
            except Exception as e:
                print(f"Error crawling {absurl}: {e}")
                
    return result

# Public helpers
async def scrape_live(
        base_url: str = BASE_URL,
        output_dir: str = "data",
        depth: int = 1,
) -> List[tuple[str, pathlib.Path]]:
    """
    Scrape base_url and returns a list of (URL, Path) tuples.
    """
    out = pathlib.Path(output_dir).resolve()
    out.mkdir(parents=True, exist_ok=True)
    
    results = []
    
    async with aiohttp.ClientSession() as session:
        # Get all document links
        links = await _get_links(base_url, depth=depth, session=session)
        
        for url in tqdm.tqdm(links, desc="Downloading"):
            name = pathlib.Path(urllib.parse.urlparse(url).path).name
            if not name:
                name = f"document_{len(results)}.pdf"
            dest = out / name
            
            # Skip if file already exists
            if dest.exists():
                results.append((url, dest))
                continue
                
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                    resp.raise_for_status()
                    content = await resp.read()
                    
                    # Save file
                    with open(dest, "wb") as fh:
                        fh.write(content)
                    
                    results.append((url, dest))
                    
            except Exception as e:
                print(f"Error downloading {url}: {e}")
    
    process_directory(output_dir, output_dir) # Process downloaded files
    return results

# Wayback machine scraping
WAYBACK_FMT = "https://web.archive.org/web/20231231212000id_/{path}"

async def scrape_wayback(
        base_url: str = BASE_URL,
        output_dir: str = "wayback",
        depth: int = 1,
) -> List[tuple[str, pathlib.Path]]:
    """
    Same as scrape_live but using Wayback machine.
    """
    out = pathlib.Path(output_dir).resolve()
    out.mkdir(parents=True, exist_ok=True)
    
    results = []
    
    async with aiohttp.ClientSession() as session:
        # Get original links first
        links = await _get_links(base_url, depth=depth, session=session)
        
        for url in tqdm.tqdm(links, desc="Downloading via Wayback"):
            url_path = urllib.parse.urlparse(url).path
            wayback_url = WAYBACK_FMT.format(path=url_path)
            
            name = pathlib.Path(url).name
            dest = out / name
            
            if dest.exists():
                results.append((url, dest))
                continue
                
            try:
                async with session.get(wayback_url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                    resp.raise_for_status()
                    content = await resp.read()
                    
                    with open(dest, "wb") as fh:
                        fh.write(content)
                    
                    results.append((url, dest))
                    
            except Exception as e:
                print(f"Error downloading {wayback_url}: {e}")
    
    process_directory(output_dir, output_dir) # Process downloaded files
    return results

# Synchronous wrappers for CLI
def scrape_live_sync(**kwargs):
    """Synchronous wrapper for scrape_live"""
    return asyncio.run(scrape_live(**kwargs))

def scrape_wayback_sync(**kwargs):
    """Synchronous wrapper for scrape_wayback"""
    return asyncio.run(scrape_wayback(**kwargs))


# Public helpers
async def scrape_live(
        base_url: str = BASE_URL,
        output_dir: str = "data",
        depth: int = 1,
) -> List[tuple[str, pathlib.Path]]:
    """
    Scrape base_url and returns a list of (URL, Path) tuples.
    """
    out = pathlib.Path(output_dir).resolve()
    out.mkdir(parents=True, exist_ok=True)
    
    results = []
    
    async with aiohttp.ClientSession() as session:
        # Get all document links
        links = await _get_links(base_url, depth=depth, session=session)
        
        for url in tqdm.tqdm(links, desc="Downloading"):
            name = pathlib.Path(urllib.parse.urlparse(url).path).name
            if not name:
                name = f"document_{len(results)}.pdf"
            dest = out / name
            
            # Skip if file already exists
            if dest.exists():
                results.append((url, dest))
                continue
                
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                    resp.raise_for_status()
                    content = await resp.read()
                    
                    # Save file
                    with open(dest, "wb") as fh:
                        fh.write(content)
                    
                    results.append((url, dest))
                    
            except Exception as e:
                print(f"Error downloading {url}: {e}")
                
    return results

# Wayback machine scraping
WAYBACK_FMT = "https://web.archive.org/web/20231231212000id_/{path}"

async def scrape_wayback(
        base_url: str = BASE_URL,
        output_dir: str = "wayback",
        depth: int = 1,
) -> List[tuple[str, pathlib.Path]]:
    """
    Same as scrape_live but using Wayback machine.
    """
    out = pathlib.Path(output_dir).resolve()
    out.mkdir(parents=True, exist_ok=True)
    
    results = []
    
    async with aiohttp.ClientSession() as session:
        # Get original links first
        links = await _get_links(base_url, depth=depth, session=session)
        
        for url in tqdm.tqdm(links, desc="Downloading via Wayback"):
            url_path = urllib.parse.urlparse(url).path
            wayback_url = WAYBACK_FMT.format(path=url_path)
            
            name = pathlib.Path(url).name
            dest = out / name
            
            if dest.exists():
                results.append((url, dest))
                continue
                
            try:
                async with session.get(wayback_url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                    resp.raise_for_status()
                    content = await resp.read()
                    
                    with open(dest, "wb") as fh:
                        fh.write(content)
                    
                    results.append((url, dest))
                    
            except Exception as e:
                print(f"Error downloading {wayback_url}: {e}")
                
    return results

# Synchronous wrappers for CLI
def scrape_live_sync(**kwargs):
    """Synchronous wrapper for scrape_live"""
    return asyncio.run(scrape_live(**kwargs))

def scrape_wayback_sync(**kwargs):
    """Synchronous wrapper for scrape_wayback"""
    return asyncio.run(scrape_wayback(**kwargs))
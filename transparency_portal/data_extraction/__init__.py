"""
This package contains modules for extracting data from various sources.
"""

from .official_sources import scrape_boletin_oficial, scrape_official_site, scrape_full_site

__all__ = [
    'scrape_boletin_oficial',
    'scrape_official_site',
    'scrape_full_site',
]

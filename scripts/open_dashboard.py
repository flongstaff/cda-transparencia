#!/usr/bin/env python3
"""
Dashboard Viewer Script
Opens the visualization dashboard in a web browser
"""

import webbrowser
import os
from pathlib import Path

def open_dashboard():
    """Open the dashboard in the default web browser"""
    
    # Get the absolute path to the dashboard HTML file
    dashboard_path = Path("/Users/flong/Developer/cda-transparencia/data/dashboard.html")
    
    if not dashboard_path.exists():
        print("❌ Dashboard file not found!")
        print(f"   Expected location: {dashboard_path}")
        return False
    
    # Convert to file URL
    dashboard_url = dashboard_path.absolute().as_uri()
    
    print("🌐 Opening dashboard in web browser...")
    print(f"   Location: {dashboard_url}")
    
    # Open in web browser
    try:
        webbrowser.open(dashboard_url)
        print("✅ Dashboard opened successfully!")
        return True
    except Exception as e:
        print(f"❌ Error opening dashboard: {e}")
        return False

if __name__ == "__main__":
    open_dashboard()
#!/usr/bin/env python3

import os
from pathlib import Path

def main():
    """Main function to create the Cloudflare-optimized repository structure"""
    print("Creating Cloudflare-optimized repository structure...")
    
    # Define the structure
    directories = [
        'data/raw',
        'data/processed',
        'notebooks',
        'public/charts',
        'public/css',
        'src',
        'dashboards',
        'docs'
    ]
    
    # Create directories
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {directory}")
    
    print("")
    print("🎉 Repository structure creation complete!")
    print("")
    print("Next steps:")
    print("1. Move your data files to data/raw/")
    print("2. Run python src/clean_data.py to process data")
    print("3. Run the Jupyter notebook to generate charts")
    print("4. Deploy the public/ directory to Cloudflare Pages")

if __name__ == "__main__":
    main()
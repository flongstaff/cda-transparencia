#!/usr/bin/env python3
"""
Generate Markdown Versions of All Processed Files

This script creates markdown versions of all files in the source_materials directory
using the existing convert_data_to_markdown.py script.
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_markdown.py <source_materials_directory> <output_markdown_directory>")
        print("Example: python generate_markdown.py data/source_materials data/markdown_documents")
        sys.exit(1)
    
    source_dir = sys.argv[1]
    output_dir = sys.argv[2]
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Generating markdown versions for files in: {source_dir}")
    print(f"Output directory: {output_dir}")
    
    # Run the existing convert_data_to_markdown.py script
    converter_script = os.path.join(os.path.dirname(__file__), 'convert_data_to_markdown.py')
    
    if not os.path.exists(converter_script):
        print(f"Error: Converter script not found at {converter_script}")
        sys.exit(1)
    
    try:
        # Run the converter script
        result = subprocess.run([
            'python3', converter_script
        ], cwd=os.path.dirname(os.path.dirname(__file__)), capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Markdown generation completed successfully!")
            print(result.stdout)
        else:
            print("Error during markdown generation:")
            print(result.stderr)
            
    except Exception as e:
        print(f"Error running markdown converter: {e}")

if __name__ == "__main__":
    main()
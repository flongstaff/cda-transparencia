"""
Setup script for MCP notebook environment
"""
import os
import subprocess
import sys

def setup_mcp_environment():
    """Setup MCP environment for notebooks"""
    
    # Create required directories
    directories = [
        'notebooks/data',
        'notebooks/cache',
        'notebooks/logs'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")
    
    # Install required packages if not already installed
    required_packages = [
        'pandas',
        'numpy', 
        'jupyter',
        'matplotlib',
        'seaborn'
    ]
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package} already installed")
        except ImportError:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    
    # Create example data files
    create_example_data()
    
    print("\n✅ MCP Environment Setup Complete!")
    print("You can now run the notebook with: jupyter notebook notebooks/MCP_Data_Pipeline_Demo.ipynb")

def create_example_data():
    """Create example data files for notebook demonstration"""
    
    # Create sample budget data
    import pandas as pd
    
    budget_data = pd.DataFrame({
        'year': [2019, 2020, 2021, 2022, 2023, 2024],
        'budgeted': [950000, 1000000, 1050000, 1100000, 1150000, 1200000],
        'executed': [930000, 980000, 1020000, 1070000, 1120000, 1180
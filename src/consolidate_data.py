"""
Data consolidation script to organize all processed data
"""
import pandas as pd
import os
from pathlib import Path
import json
from datetime import datetime
import glob


def consolidate_yearly_data(data_dir="data/processed"):
    """
    Consolidate data by year and data type
    """
    data_dir = Path(data_dir)
    
    # Create consolidated data by year
    yearly_data = {}
    
    for year_dir in data_dir.iterdir():
        if year_dir.is_dir() and year_dir.name.isdigit():
            year = int(year_dir.name)
            yearly_data[year] = {}
            
            # Process all CSV files for this year
            for csv_file in year_dir.glob("*.csv"):
                # Extract data type from filename
                file_stem = csv_file.stem
                if "_table_" in file_stem:
                    # Extract base name (e.g., from 'Budget_Execution_2019_table_0' get 'Budget_Execution')
                    data_type = "_".join(file_stem.split("_")[:-2])
                else:
                    data_type = file_stem
                
                if data_type not in yearly_data[year]:
                    yearly_data[year][data_type] = []
                
                try:
                    df = pd.read_csv(csv_file)
                    df['year'] = year  # Add year column
                    yearly_data[year][data_type].append(df)
                except Exception as e:
                    print(f"Error reading {csv_file}: {e}")
    
    # Consolidate dataframes of the same type across years
    consolidated = {}
    output_dir = Path("data/consolidated")
    output_dir.mkdir(exist_ok=True)
    
    for year, data_types in yearly_data.items():
        for data_type, dfs in data_types.items():
            if data_type not in consolidated:
                consolidated[data_type] = []
            consolidated[data_type].extend(dfs)
    
    # Save consolidated data
    for data_type, dfs in consolidated.items():
        if dfs:  # Only save if there are dataframes to combine
            try:
                combined_df = pd.concat(dfs, ignore_index=True, sort=False)
                output_file = output_dir / f"{data_type}_consolidated_2019-2025.csv"
                combined_df.to_csv(output_file, index=False)
                print(f"Saved consolidated {data_type} data to {output_file}")
            except Exception as e:
                print(f"Error consolidating {data_type}: {e}")
    
    return consolidated


def create_data_inventory():
    """
    Create an inventory of all data files
    """
    inventory = {
        "created_at": datetime.now().isoformat(),
        "data_sources": {
            "processed": [],
            "raw": [],
            "external": [],
            "consolidated": []
        },
        "summary": {}
    }
    
    # Process directories
    for source_type in ["processed", "raw", "external", "consolidated"]:
        source_dir = Path(f"data/{source_type}")
        if source_dir.exists():
            for file_path in source_dir.rglob("*"):
                if file_path.is_file() and file_path.suffix.lower() in ['.csv', '.json', '.xlsx', '.xls', '.pdf']:
                    file_info = {
                        "path": str(file_path),
                        "name": file_path.name,
                        "size": file_path.stat().st_size,
                        "modified": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
                        "type": file_path.suffix.lower()[1:] if file_path.suffix else "unknown"
                    }
                    inventory["data_sources"][source_type].append(file_info)
    
    # Create summary
    for source_type, files in inventory["data_sources"].items():
        inventory["summary"][source_type] = {
            "total_files": len(files),
            "total_size": sum(f["size"] for f in files),
            "file_types": {}
        }
        
        for file_info in files:
            file_type = file_info["type"]
            if file_type not in inventory["summary"][source_type]["file_types"]:
                inventory["summary"][source_type]["file_types"][file_type] = 0
            inventory["summary"][source_type]["file_types"][file_type] += 1
    
    # Save inventory
    inventory_path = Path("data/metadata/data_inventory.json")
    inventory_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(inventory_path, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)
    
    print(f"Data inventory saved to {inventory_path}")
    return inventory


def organize_by_category():
    """
    Organize data by category (budget, revenue, expenditure, etc.)
    """
    category_dir = Path("data/categorized")
    category_dir.mkdir(exist_ok=True)
    
    # Define categories based on keywords
    categories = {
        'budget': ['budget', 'presupuesto'],
        'revenue': ['revenue', 'recursos', 'ingresos'],
        'expenditure': ['expenditure', 'gastos', 'gasto', 'ejecucion'],
        'debt': ['debt', 'deuda'],
        'personnel': ['personnel', 'personal', 'sueldo', 'salario'],
        'investment': ['investment', 'inversion', 'proyecto'],
        'health': ['health', 'salud', 'caps'],
        'education': ['education', 'educacion'],
        'infrastructure': ['infrastructure', 'infraestructura', 'obra'],
        'financial': ['financial', 'financiero', 'economica', 'economía'],
        'gender': ['gender', 'genero', 'perspectiva', 'femenino']
    }
    
    # Find all CSV files in processed directory
    processed_files = list(Path("data/processed").rglob("*.csv"))
    categorized_files = {}
    
    for csv_file in processed_files:
        # Determine category based on filename
        filename_lower = csv_file.name.lower()
        assigned_category = None
        
        for category, keywords in categories.items():
            if any(keyword in filename_lower for keyword in keywords):
                assigned_category = category
                break
        
        if assigned_category:
            if assigned_category not in categorized_files:
                categorized_files[assigned_category] = []
            categorized_files[assigned_category].append(csv_file)
    
    # Create category directories and copy files
    for category, files in categorized_files.items():
        cat_dir = category_dir / category
        cat_dir.mkdir(exist_ok=True)
        print(f"Category '{category}': {len(files)} files")
    
    print(f"Organized data into {len(categorized_files)} categories")
    return categorized_files


def create_master_index():
    """
    Create a master index of all data
    """
    master_index = {
        "created_at": datetime.now().isoformat(),
        "index": []
    }
    
    # Include processed data
    for csv_file in Path("data/processed").rglob("*.csv"):
        relative_path = csv_file.relative_to(Path.cwd())
        df = pd.read_csv(csv_file)
        
        file_index = {
            "file_path": str(relative_path),
            "file_type": "processed",
            "name": csv_file.stem,
            "size": csv_file.stat().st_size,
            "rows": len(df),
            "columns": list(df.columns),
            "column_types": {col: str(df[col].dtype) for col in df.columns},
            "sample_data": df.head(3).to_dict('records') if len(df) > 0 else [],
            "modified": datetime.fromtimestamp(csv_file.stat().st_mtime).isoformat()
        }
        master_index["index"].append(file_index)
    
    # Include consolidated data
    for csv_file in Path("data/consolidated").rglob("*.csv"):
        relative_path = csv_file.relative_to(Path.cwd())
        df = pd.read_csv(csv_file)
        
        file_index = {
            "file_path": str(relative_path),
            "file_type": "consolidated",
            "name": csv_file.stem,
            "size": csv_file.stat().st_size,
            "rows": len(df),
            "columns": list(df.columns),
            "column_types": {col: str(df[col].dtype) for col in df.columns},
            "sample_data": df.head(3).to_dict('records') if len(df) > 0 else [],
            "modified": datetime.fromtimestamp(csv_file.stat().st_mtime).isoformat()
        }
        master_index["index"].append(file_index)
    
    # Save master index
    index_path = Path("data/metadata/master_index.json")
    index_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(master_index, f, indent=2, ensure_ascii=False)
    
    print(f"Master index saved to {index_path}")
    return master_index


def standardize_column_names(df, category=None):
    """
    Standardize column names based on common patterns
    """
    column_mapping = {
        # Budget related
        'budgeted': ['budget', 'presupuesto', 'monto_presupuestado', 'budget_amount'],
        'executed': ['executed', 'ejecutado', 'monto_ejecutado', 'executed_amount'],
        'percentage': ['percentage', 'porcentaje', 'porc_ejecutado'],
        'amount': ['amount', 'monto', 'importe'],
        
        # Time related
        'year': ['year', 'año', 'anio', 'ejercicio'],
        'month': ['month', 'mes'],
        'quarter': ['quarter', 'trimestre', 'trim'],
        
        # Category related
        'sector': ['sector', 'area', 'departamento', 'jurisdiccion'],
        'program': ['program', 'programa', 'subprograma', 'proyecto'],
        'source': ['source', 'fuente', 'procedencia'],
        
        # Personnel related
        'position': ['position', 'cargo', 'puesto'],
        'gender': ['gender', 'genero', 'sexo'],
        'salary': ['salary', 'sueldo', 'remuneracion', 'salario'],
    }
    
    # Create reverse mapping
    reverse_mapping = {}
    for standard_name, variations in column_mapping.items():
        for variation in variations:
            reverse_mapping[variation.lower()] = standard_name
    
    # Rename columns
    new_columns = {}
    for col in df.columns:
        col_lower = col.lower().replace('_', '').replace(' ', '')
        if col_lower in reverse_mapping:
            new_columns[col] = reverse_mapping[col_lower]
        else:
            new_columns[col] = col  # Keep original if no mapping found
    
    df_renamed = df.rename(columns=new_columns)
    return df_renamed


def clean_and_standardize_data():
    """
    Clean and standardize all data for consistent use
    """
    processed_dir = Path("data/processed")
    cleaned_dir = Path("data/cleaned")
    cleaned_dir.mkdir(exist_ok=True)
    
    for csv_file in processed_dir.rglob("*.csv"):
        try:
            df = pd.read_csv(csv_file)
            
            # Clean common issues
            # Remove empty rows
            df = df.dropna(how='all')
            
            # Remove empty columns
            df = df.dropna(axis=1, how='all')
            
            # Standardize column names
            df = standardize_column_names(df)
            
            # Convert common date columns to datetime if they exist
            for col in df.columns:
                if 'date' in col.lower() or 'fecha' in col.lower():
                    try:
                        df[col] = pd.to_datetime(df[col])
                    except:
                        pass  # If conversion fails, keep as is
            
            # Convert numeric columns
            for col in df.columns:
                # Attempt to convert to numeric if it looks like numbers
                if df[col].dtype == 'object':
                    # Try to convert strings that look like numbers
                    df_converted = df[col].apply(pd.to_numeric, errors='coerce')
                    if not df_converted.isna().all():  # If at least some values converted
                        df[col] = df_converted
            
            # Save cleaned file
            relative_path = csv_file.relative_to(processed_dir)
            output_path = cleaned_dir / relative_path
            output_path.parent.mkdir(parents=True, exist_ok=True)
            df.to_csv(output_path, index=False)
            
            print(f"Cleaned and standardized: {csv_file.name}")
            
        except Exception as e:
            print(f"Error processing {csv_file}: {e}")


if __name__ == "__main__":
    print("Starting comprehensive data organization...")
    
    # Create consolidated data
    print("Creating consolidated data...")
    consolidate_yearly_data()
    
    # Create data inventory
    print("Creating data inventory...")
    create_data_inventory()
    
    # Organize by category
    print("Organizing by category...")
    organize_by_category()
    
    # Create master index
    print("Creating master index...")
    create_master_index()
    
    # Clean and standardize data
    print("Cleaning and standardizing data...")
    clean_and_standardize_data()
    
    print("Data organization complete!")
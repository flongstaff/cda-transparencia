"""
Module for validating data consistency and correctness
"""
import pandas as pd


def validate_budget_execution(df: pd.DataFrame) -> list:
    """
    Validate that budgeted amounts are greater than or equal to executed amounts
    
    Args:
        df: DataFrame with budget and execution columns
        
    Returns:
        List of validation errors
    """
    errors = []
    
    # Placeholder validation logic - customize based on your columns
    if 'budget' in df.columns and 'execution' in df.columns:
        invalid_rows = df[df['budget'] < df['execution']]
        for idx, row in invalid_rows.iterrows():
            errors.append(f"Row {idx}: Budget ({row['budget']}) < Execution ({row['execution']})")
    
    return errors


def validate_required_columns(df: pd.DataFrame, required_columns: list) -> list:
    """
    Validate that required columns exist in the DataFrame
    
    Args:
        df: Input DataFrame
        required_columns: List of required column names
        
    Returns:
        List of validation errors
    """
    errors = []
    
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns: {missing_cols}")
    
    return errors


def validate_data_types(df: pd.DataFrame, expected_types: dict) -> list:
    """
    Validate that columns have expected data types
    
    Args:
        df: Input DataFrame
        expected_types: Dictionary mapping column names to expected types
        
    Returns:
        List of validation errors
    """
    errors = []
    
    for col, expected_type in expected_types.items():
        if col in df.columns:
            actual_type = df[col].dtype
            if not str(actual_type).startswith(expected_type.__name__):
                errors.append(f"Column '{col}' has type '{actual_type}', expected '{expected_type}'")
    
    return errors


def validate_date_ranges(df: pd.DataFrame, date_col: str, start_date=None, end_date=None) -> list:
    """
    Validate that dates fall within expected ranges
    
    Args:
        df: Input DataFrame
        date_col: Name of the date column
        start_date: Optional start date for validation
        end_date: Optional end date for validation
        
    Returns:
        List of validation errors
    """
    errors = []
    
    if date_col in df.columns:
        # Convert to datetime if not already
        if not pd.api.types.is_datetime64_any_dtype(df[date_col]):
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        
        if start_date:
            invalid_dates = df[df[date_col] < start_date]
            for idx, row in invalid_dates.iterrows():
                errors.append(f"Row {idx}: Date ({row[date_col]}) is before start date ({start_date})")
                
        if end_date:
            invalid_dates = df[df[date_col] > end_date]
            for idx, row in invalid_dates.iterrows():
                errors.append(f"Row {idx}: Date ({row[date_col]}) is after end date ({end_date})")
    
    return errors


def run_validation_pipeline(df: pd.DataFrame) -> dict:
    """
    Run all validation checks on a DataFrame
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary with validation results
    """
    results = {
        'errors': [],
        'warnings': [],
        'passed': True
    }
    
    # Add your specific validation rules here
    results['errors'].extend(validate_required_columns(df, []))  # Add required columns
    results['errors'].extend(validate_budget_execution(df))     # If budget data exists
    # Add more validations as needed
    
    if results['errors']:
        results['passed'] = False
        
    return results
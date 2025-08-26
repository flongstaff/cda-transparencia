"""
This module contains functions for performing data analysis.
"""

import pandas as pd
from typing import Dict, Any, List

def detect_anomalies(df: pd.DataFrame, column: str, threshold: float = 2.0) -> pd.DataFrame:
    """
    Detects anomalies in a DataFrame column using the Z-score method.
    """
    df['z_score'] = (df[column] - df[column].mean()) / df[column].std()
    anomalies = df[df['z_score'].abs() > threshold]
    return anomalies

def analyze_budget_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Performs a detailed analysis of budget data.
    """
    analysis = {}
    
    # Calculate execution percentage
    if 'budgeted_amount' in df.columns and 'executed_amount' in df.columns:
        df['execution_percentage'] = (df['executed_amount'] / df['budgeted_amount']) * 100
        analysis['average_execution_percentage'] = df['execution_percentage'].mean()
    
    # Calculate variance
    if 'budgeted_amount' in df.columns and 'executed_amount' in df.columns:
        df['variance'] = df['budgeted_amount'] - df['executed_amount']
        analysis['total_variance'] = df['variance'].sum()
        
    # Get top 5 over-budget items
    if 'variance' in df.columns:
        analysis['top_5_over_budget'] = df[df['variance'] < 0].sort_values(by='variance', ascending=True).head(5).to_dict('records')
        
    # Get top 5 under-budget items
    if 'variance' in df.columns:
        analysis['top_5_under_budget'] = df[df['variance'] > 0].sort_values(by='variance', ascending=False).head(5).to_dict('records')
        
    return analysis

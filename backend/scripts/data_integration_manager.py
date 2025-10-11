#!/usr/bin/env python3
"""
Data Integration Manager for Carmen de Areco Transparency Portal

This script integrates OCR-extracted data with existing CSV datasets,
provides comparison functionality, and maintains data consistency.
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import re


class DataIntegrationManager:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.data_dir = self.project_root / "data"
        self.raw_csv_dir = self.data_dir / "raw" / "csv"
        self.ocr_csv_dir = self.data_dir / "ocr_extracted" / "csv"
        self.processed_dir = self.data_dir / "processed"
        self.comparison_dir = self.data_dir / "processed" / "comparison"
        
        # Create directories
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        self.comparison_dir.mkdir(parents=True, exist_ok=True)

    def load_all_csvs(self) -> Dict[str, pd.DataFrame]:
        """Load all existing CSV files into a dictionary."""
        csvs = {}
        
        # Load raw CSVs
        for csv_file in self.raw_csv_dir.glob("*.csv"):
            try:
                df = pd.read_csv(csv_file)
                csvs[csv_file.stem] = df
                print(f"Loaded CSV: {csv_file.name} ({len(df)} rows, {len(df.columns)} columns)")
            except Exception as e:
                print(f"Error loading CSV {csv_file.name}: {str(e)}")
        
        # Load OCR-extracted CSVs
        for csv_file in self.ocr_csv_dir.glob("*.csv") if self.ocr_csv_dir.exists() else []:
            try:
                df = pd.read_csv(csv_file)
                csvs[csv_file.stem] = df
                print(f"Loaded OCR CSV: {csv_file.name} ({len(df)} rows, {len(df.columns)} columns)")
            except Exception as e:
                print(f"Error loading OCR CSV {csv_file.name}: {str(e)}")
        
        return csvs

    def find_similar_dataframes(self, csvs: Dict[str, pd.DataFrame]) -> List[tuple]:
        """Find dataframes that likely contain similar data based on column names."""
        similar_pairs = []
        csv_names = list(csvs.keys())
        
        for i in range(len(csv_names)):
            for j in range(i + 1, len(csv_names)):
                name1, name2 = csv_names[i], csv_names[j]
                df1, df2 = csvs[name1], csvs[name2]
                
                # Calculate similarity based on column names
                cols1 = set(df1.columns.str.lower())
                cols2 = set(df2.columns.str.lower())
                
                if cols1 & cols2:  # If there are common columns
                    similarity = len(cols1 & cols2) / len(cols1 | cols2)  # Jaccard similarity
                    if similarity > 0.3:  # At least 30% column overlap
                        similar_pairs.append((name1, name2, similarity, df1, df2))
        
        return similar_pairs

    def integrate_similar_dataframes(self, df1: pd.DataFrame, df2: pd.DataFrame, 
                                   name1: str, name2: str) -> pd.DataFrame:
        """Attempt to intelligently merge two similar dataframes."""
        # Find common columns
        common_cols = set(df1.columns) & set(df2.columns)
        
        if not common_cols:
            print(f"No common columns found between {name1} and {name2}. Creating concatenated dataframe.")
            # If no common columns, concatenate with different prefixes
            df1_renamed = df1.add_suffix('_from_' + name1.replace('.csv', ''))
            df2_renamed = df2.add_suffix('_from_' + name2.replace('.csv', ''))
            return pd.concat([df1_renamed, df2_renamed], axis=1, ignore_index=False)
        
        # Check if there are unique keys to join on (like date, id, etc.)
        potential_keys = [col for col in common_cols 
                         if 'date' in col.lower() or 'id' in col.lower() or 
                         'ano' in col.lower() or 'year' in col.lower() or
                         'period' in col.lower() or 'mes' in col.lower()]
        
        if potential_keys:
            # Use the first potential key for joining
            key = potential_keys[0]
            
            # Try to join on the key
            try:
                # Ensure the key column exists in both dataframes
                if key in df1.columns and key in df2.columns:
                    # Perform an outer join to preserve all data
                    integrated_df = pd.merge(df1, df2, on=key, how='outer', suffixes=('', '_duplicate'))
                    
                    # Handle duplicate columns (those with suffix _duplicate)
                    duplicate_cols = [col for col in integrated_df.columns if '_duplicate' in col]
                    for col in duplicate_cols:
                        original_col = col.replace('_duplicate', '')
                        # Fill NaN values in original column with values from duplicate column
                        integrated_df[original_col] = integrated_df[original_col].fillna(integrated_df[col])
                        # Drop the duplicate column
                        integrated_df = integrated_df.drop(columns=[col])
                    
                    return integrated_df
            except Exception as e:
                print(f"Error merging on key '{key}': {str(e)}")
        
        # If no good joining key or merge fails, try to find unique rows and combine
        print(f"No suitable key found for joining {name1} and {name2}. Combining rows.")
        
        # Try to identify potentially duplicate rows based on all common columns
        if len(common_cols) > 0:
            try:
                # Concatenate the dataframes and drop exact duplicates
                combined_df = pd.concat([df1, df2], ignore_index=True)
                unique_df = combined_df.drop_duplicates(subset=list(common_cols), keep='first')
                return unique_df
            except Exception:
                # If dropping duplicates fails, just concatenate
                return pd.concat([df1, df2], ignore_index=True)
        
        # If all else fails, concatenate with a source indicator
        df1['source'] = name1
        df2['source'] = name2
        return pd.concat([df1, df2], ignore_index=True)

    def update_existing_csvs(self) -> Dict[str, Any]:
        """Update existing CSVs with new information from OCR-extracted data."""
        print("Updating existing CSVs with OCR-extracted data...")
        
        # Load all CSVs
        all_csvs = self.load_all_csvs()
        
        # Find similar dataframes
        similar_pairs = self.find_similar_dataframes(all_csvs)
        
        update_stats = {
            "updated_files": [],
            "new_combined_files": [],
            "errors": []
        }
        
        for name1, name2, similarity, df1, df2 in similar_pairs:
            print(f"Processing similar pair: {name1} and {name2} (similarity: {similarity:.2f})")
            
            try:
                # Integrate the dataframes
                integrated_df = self.integrate_similar_dataframes(df1, df2, name1, name2)
                
                # Determine output filename
                base_name = f"integrated_{name1}_with_{name2}"
                output_path = self.processed_dir / f"{base_name}.csv"
                
                # Save the integrated dataframe
                integrated_df.to_csv(output_path, index=False, encoding='utf-8')
                print(f"  Saved integrated data to: {output_path}")
                
                update_stats["new_combined_files"].append({
                    "output_file": str(output_path),
                    "input_files": [name1, name2],
                    "rows": len(integrated_df),
                    "columns": len(integrated_df.columns),
                    "similarity": similarity
                })
            except Exception as e:
                print(f"  Error integrating {name1} and {name2}: {str(e)}")
                update_stats["errors"].append({
                    "file_pair": [name1, name2],
                    "error": str(e)
                })
        
        # Save update statistics
        stats_path = self.processed_dir / "integration_stats.json"
        with open(stats_path, 'w', encoding='utf-8') as f:
            json.dump(update_stats, f, indent=2, default=str)
        
        print(f"Integration statistics saved to: {stats_path}")
        return update_stats

    def compare_data_sources(self) -> Dict[str, Any]:
        """Compare different data sources to identify discrepancies and consistencies."""
        print("Comparing data sources...")
        
        comparison_results = {
            "comparison_timestamp": datetime.now().isoformat(),
            "source_files": [],
            "comparisons": [],
            "summary": {}
        }
        
        # Load all CSVs
        all_csvs = self.load_all_csvs()
        
        if not all_csvs:
            print("No CSV files found to compare.")
            return comparison_results
        
        # Add source file information
        for name, df in all_csvs.items():
            comparison_results["source_files"].append({
                "filename": name,
                "rows": len(df),
                "columns": len(df.columns),
                "columns_list": df.columns.tolist(),
                "date_columns": [col for col in df.columns if 'date' in col.lower() or 'ano' in col.lower() or 'year' in col.lower()],
                "numeric_columns": [col for col in df.columns if pd.api.types.is_numeric_dtype(df[col])]
            })
        
        # Find dataframes with potential for comparison based on common columns
        csv_names = list(all_csvs.keys())
        for i in range(len(csv_names)):
            for j in range(i + 1, len(csv_names)):
                name1, name2 = csv_names[i], csv_names[j]
                df1, df2 = all_csvs[name1], all_csvs[name2]
                
                # Find common columns
                common_cols = list(set(df1.columns) & set(df2.columns))
                
                if len(common_cols) > 0:
                    comparison = {
                        "file1": name1,
                        "file2": name2,
                        "common_columns": common_cols,
                        "comparison_details": []
                    }
                    
                    # Compare data in common columns
                    for col in common_cols:
                        if col in df1.columns and col in df2.columns:
                            # Check if column data types are compatible
                            if (pd.api.types.is_numeric_dtype(df1[col]) and pd.api.types.is_numeric_dtype(df2[col])):
                                # Compare numeric data
                                stats1 = {
                                    "count": df1[col].count(),
                                    "mean": df1[col].mean() if df1[col].count() > 0 else None,
                                    "sum": df1[col].sum() if df1[col].count() > 0 else None
                                }
                                stats2 = {
                                    "count": df2[col].count(),
                                    "mean": df2[col].mean() if df2[col].count() > 0 else None,
                                    "sum": df2[col].sum() if df2[col].count() > 0 else None
                                }
                                
                                comparison["comparison_details"].append({
                                    "column": col,
                                    "type": "numeric",
                                    "file1_stats": stats1,
                                    "file2_stats": stats2,
                                    "discrepancy": not (round(stats1.get("sum", 0) or 0, 2) == round(stats2.get("sum", 0) or 0, 2)) if stats1.get("sum") is not None and stats2.get("sum") is not None else True
                                })
                            elif (pd.api.types.is_datetime64_any_dtype(df1[col]) or 'date' in col.lower()):
                                # Compare date data
                                # For now, just note the min/max dates for comparison
                                comparison["comparison_details"].append({
                                    "column": col,
                                    "type": "date",
                                    "file1_date_range": {
                                        "min": str(df1[col].min()) if df1[col].count() > 0 else None,
                                        "max": str(df1[col].max()) if df1[col].count() > 0 else None
                                    },
                                    "file2_date_range": {
                                        "min": str(df2[col].min()) if df2[col].count() > 0 else None,
                                        "max": str(df2[col].max()) if df2[col].count() > 0 else None
                                    }
                                })
                            else:
                                # For other types, compare basic stats
                                comparison["comparison_details"].append({
                                    "column": col,
                                    "type": "other",
                                    "file1_unique_count": df1[col].nunique() if df1[col].count() > 0 else 0,
                                    "file2_unique_count": df2[col].nunique() if df2[col].count() > 0 else 0,
                                    "file1_total_count": df1[col].count(),
                                    "file2_total_count": df2[col].count()
                                })
                    
                    comparison_results["comparisons"].append(comparison)
        
        # Generate summary
        comparison_results["summary"] = {
            "total_files_compared": len(all_csvs),
            "total_comparisons_performed": len(comparison_results["comparisons"]),
            "comparisons_with_discrepancies": sum(
                1 for comp in comparison_results["comparisons"]
                if any(detail.get("discrepancy", False) for detail in comp.get("comparison_details", []))
            )
        }
        
        # Save comparison results
        comparison_path = self.comparison_dir / "data_source_comparison.json"
        with open(comparison_path, 'w', encoding='utf-8') as f:
            json.dump(comparison_results, f, indent=2, default=str)
        
        print(f"Data source comparison saved to: {comparison_path}")
        return comparison_results

    def run_integration_workflow(self):
        """Run the complete integration and comparison workflow."""
        print("="*60)
        print("DATA INTEGRATION & COMPARISON WORKFLOW")
        print("="*60)
        
        # Step 1: Update existing CSVs with new information
        print("\n1. Integrating new OCR data with existing CSVs...")
        integration_results = self.update_existing_csvs()
        
        # Step 2: Compare data sources
        print("\n2. Comparing data sources for consistency...")
        comparison_results = self.compare_data_sources()
        
        # Step 3: Generate final report
        print("\n3. Generating final integration report...")
        self.generate_final_report(integration_results, comparison_results)
        
        print("\n" + "="*60)
        print("DATA INTEGRATION WORKFLOW COMPLETE")
        print("="*60)
        print(f"Integration files created: {len(integration_results.get('new_combined_files', []))}")
        print(f"Data source comparisons: {comparison_results['summary']['total_comparisons_performed']}")
        print("="*60)

    def generate_final_report(self, integration_results: Dict, comparison_results: Dict):
        """Generate a final report of the integration results."""
        report = {
            "report_timestamp": datetime.now().isoformat(),
            "integration_results": integration_results,
            "comparison_results": {
                "summary": comparison_results["summary"],
                "comparison_timestamp": comparison_results["comparison_timestamp"]
            },
            "notes": [
                "This report details the integration of OCR-extracted data with existing CSV datasets",
                "New combined files are stored in the processed directory",
                "Comparison identifies potential inconsistencies between data sources"
            ]
        }
        
        report_path = self.processed_dir / "final_integration_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"Final integration report saved to: {report_path}")


def main():
    """Main function to run the data integration manager."""
    import sys
    if len(sys.argv) > 1:
        project_root = sys.argv[1]
    else:
        project_root = "."
    
    manager = DataIntegrationManager(project_root)
    manager.run_integration_workflow()


if __name__ == "__main__":
    main()
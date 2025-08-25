# Data Management Scripts

This directory contains scripts related to data organization, cleanup, and analysis within the `data/source_materials` directory.

## Scripts Overview

*   **`analyze_duplicates.sh`**: Identifies and reports potential duplicate files without making any changes.
*   **`check_document_dates.sh`**: Analyzes PDF files to extract and categorize dates, useful for data quality and categorization.
*   **`cleanup_duplicates.sh`**: Removes duplicate files and organizes the repository structure. **Use with caution and review its logic before running.**
*   **`consolidate_directories.sh`**: Consolidates `organized_materials` and `source_materials` into a single clean structure. Typically a one-time script.
*   **`maintain_organization.sh`**: Helps maintain the existing data organization structure and suggests non-disruptive improvements.
*   **`organize_data.sh`**: Organizes data files by type (declarations, budgets, tenders, etc.) into recommended directory structures.
*   **`organize_files_phase3.sh`**: Organizes files from the `not_organized` directory into proper year and category directories.
*   **`safe_cleanup_phase1.sh`**: Safely removes system files (e.g., `.DS_Store`, `Thumbs.db`).
*   **`safe_cleanup_phase2.sh`**: Safely removes obvious duplicates (e.g., numbered files, files with 'copia' in their name).

## Usage

These scripts are designed to be run from the project root directory. Always review the script content before execution, especially for scripts that perform file modifications or deletions.

Example:
```bash
./scripts/data_management/analyze_duplicates.sh
```

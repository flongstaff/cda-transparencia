#!/bin/bash

# Cleanup obsolete documentation files

echo "Cleaning up obsolete documentation..."

# Remove transparency reports
rm -f transparency_data/transparency_report_*.md

# Remove old summary files
rm -f *_SUMMARY.md
rm -f *_REPORT.md
rm -f *_OVERVIEW.md
rm -f IMPLEMENTATION_*.md
rm -f FINAL_*.md
rm -f PROJECT_*.md
rm -f DOCUMENTATION_*.md

# Remove archive documentation
rm -rf docs/archive/

# Remove duplicate markdown documents
rm -f data/markdown_documents/*_copy.md

echo "Documentation cleanup completed."
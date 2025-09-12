#!/usr/bin/env python3
"""
Script to show the latest documents by year
"""

import os
import json
from collections import defaultdict

def show_latest_documents():
    """Show the latest documents by year"""
    
    base_dir = "/Users/flong/Developer/cda-transparencia/organized_documents"
    inventory_file = os.path.join(base_dir, "document_inventory.json")
    
    # Load the inventory
    with open(inventory_file, 'r') as f:
        inventory = json.load(f)
    
    print("Latest Documents by Year:")
    print("=" * 50)
    
    # Group documents by year
    documents_by_year = defaultdict(list)
    for doc in inventory:
        documents_by_year[doc['year']].append(doc)
    
    # Show latest documents for recent years
    recent_years = sorted(documents_by_year.keys(), reverse=True)[:5]
    
    for year in recent_years:
        docs = documents_by_year[year]
        print(f"\n{year} ({len(docs)} documents):")
        
        # Show document categories for this year
        categories = set(doc['category'] for doc in docs)
        for category in sorted(categories):
            category_docs = [doc for doc in docs if doc['category'] == category]
            print(f"  {category}: {len(category_docs)} documents")
            
            # Show a few sample documents
            sample_docs = category_docs[:3]
            for doc in sample_docs:
                print(f"    - {doc['filename']}")

def show_category_breakdown():
    """Show category breakdown across all years"""
    
    base_dir = "/Users/flong/Developer/cda-transparencia/organized_documents"
    inventory_file = os.path.join(base_dir, "document_inventory.json")
    
    # Load the inventory
    with open(inventory_file, 'r') as f:
        inventory = json.load(f)
    
    print("\nCategory Breakdown:")
    print("=" * 30)
    
    # Group documents by category
    documents_by_category = defaultdict(list)
    for doc in inventory:
        documents_by_category[doc['category']].append(doc)
    
    # Show counts by category
    for category in sorted(documents_by_category.keys()):
        docs = documents_by_category[category]
        print(f"{category}: {len(docs)} documents")
        
        # Show year distribution for this category
        years = set(doc['year'] for doc in docs)
        if len(years) <= 10:
            print(f"  Years: {', '.join(sorted(years, reverse=True))}")
        else:
            print(f"  Years: {min(years)} to {max(years)} ({len(years)} years)")

def main():
    """Main function"""
    show_latest_documents()
    show_category_breakdown()

if __name__ == "__main__":
    main()
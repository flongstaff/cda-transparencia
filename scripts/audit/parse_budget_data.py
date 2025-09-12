#!/usr/bin/env python3
"""
Script to parse budget execution data from the PDF text and organize it into structured JSON
"""

import json
import sys
import re
import os

def parse_budget_execution_data(pages_data):
    """
    Parse budget execution data from the extracted PDF text
    
    Args:
        pages_data: List of dictionaries with page data
        
    Returns:
        Dictionary with organized budget execution data
    """
    
    budget_data = {
        'period': '',
        'year': '',
        'jurisdiction': '',
        'categories': {},
        'total_budgeted': 0,
        'total_executed': 0,
        'execution_rate': 0,
        'timestamp': ''
    }
    
    # Process each page
    for page_data in pages_data:
        text = page_data.get('text', '')
        if not text:
            continue
            
        # Extract period and year
        if not budget_data['period']:
            period_match = re.search(r'Del ([\d/]+) al ([\d/]+)', text)
            if period_match:
                budget_data['period'] = f"{period_match.group(1)} al {period_match.group(2)}"
                
        # Extract year
        if not budget_data['year']:
            year_match = re.search(r'Ejercicio (\d{4})', text)
            if year_match:
                budget_data['year'] = year_match.group(1)
                
        # Extract jurisdiction
        if not budget_data['jurisdiction']:
            juris_match = re.search(r'Municipalidad de\s+([^\n]+)', text)
            if juris_match:
                budget_data['jurisdiction'] = juris_match.group(1).strip()
                
        # Extract timestamp
        if not budget_data['timestamp']:
            time_match = re.search(r'(\d{2}/\d{2}/\d{4} \d{2}:\d{2})', text)
            if time_match:
                budget_data['timestamp'] = time_match.group(1)
                
        # Look for budget data lines
        lines = text.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Look for category lines (e.g. "1.0.0.0 - Gastos en personal")
            category_match = re.match(r'^(\d+\.\d+\.\d+\.\d+)\s*-\s*(.+)$', line)
            if category_match:
                category_code = category_match.group(1)
                category_name = category_match.group(2).strip()
                
                # Skip lines that don't have financial data
                j = i + 1
                while j < len(lines) and lines[j].strip() and not re.match(r'^(\d+\.\d+\.\d+\.\d+)\s*-', lines[j]):
                    # Look for financial data on this line
                    financial_line = lines[j].strip()
                    
                    # Check if this line has financial numbers
                    financial_numbers = re.findall(r'[\d\.,]+', financial_line)
                    if len(financial_numbers) >= 4:  # Should have at least 4 numbers (Aprobado, Vigente, Devengado, Pagado)
                        try:
                            # Extract the financial numbers
                            nums = re.findall(r'(\d+(?:\.\d{3})*(?:,\d{2})?)', financial_line)
                            
                            if len(nums) >= 4:
                                budgeted = float(nums[0].replace('.', '').replace(',', '.'))
                                executed = float(nums[3].replace('.', '').replace(',', '.')) if len(nums) > 3 else 0
                                
                                budget_data['categories'][category_name] = {
                                    'code': category_code,
                                    'budgeted': budgeted,
                                    'executed': executed,
                                    'execution_rate': round((executed / budgeted * 100), 2) if budgeted > 0 else 0
                                }
                                
                                budget_data['total_budgeted'] += budgeted
                                budget_data['total_executed'] += executed
                                
                                break
                                
                        except (ValueError, IndexError):
                            pass
                    
                    j += 1
                    
            i += 1
    
    # Calculate overall execution rate
    if budget_data['total_budgeted'] > 0:
        budget_data['execution_rate'] = round((budget_data['total_executed'] / budget_data['total_budgeted'] * 100), 2)
    else:
        budget_data['execution_rate'] = 0
        
    return budget_data

def parse_detailed_budget_data(pages_data):
    """
    Parse detailed budget data from the PDF text
    
    Args:
        pages_data: List of dictionaries with page data
        
    Returns:
        Dictionary with detailed budget execution data
    """
    
    budget_data = {
        'metadata': {
            'period': '',
            'year': '',
            'jurisdiction': '',
            'timestamp': ''
        },
        'summary': {
            'total_budgeted': 0,
            'total_executed': 0,
            'execution_rate': 0
        },
        'categories': [],
        'subcategories': []
    }
    
    # Process each page looking for structured data
    for page_data in pages_data:
        text = page_data.get('text', '')
        if not text:
            continue
            
        # Extract metadata from first few pages
        if not budget_data['metadata']['period']:
            period_match = re.search(r'Del ([\d/]+) al ([\d/]+)', text)
            if period_match:
                budget_data['metadata']['period'] = f"{period_match.group(1)} al {period_match.group(2)}"
                
        if not budget_data['metadata']['year']:
            year_match = re.search(r'Ejercicio (\d{4})', text)
            if year_match:
                budget_data['metadata']['year'] = year_match.group(1)
                
        if not budget_data['metadata']['jurisdiction']:
            juris_match = re.search(r'Municipalidad de\s+([^\n]+)', text)
            if juris_match:
                budget_data['metadata']['jurisdiction'] = juris_match.group(1).strip()
                
        if not budget_data['metadata']['timestamp']:
            time_match = re.search(r'(\d{2}/\d{2}/\d{4} \d{2}:\d{2})', text)
            if time_match:
                budget_data['metadata']['timestamp'] = time_match.group(1)
                
        # Look for detailed budget data sections
        lines = text.split('\n')
        i = 0
        current_jurisdiction = None
        current_program = None
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Look for jurisdiction (e.g. "110 - Tesoro Municipal")
            jur_match = re.match(r'^(\d+) - (.+)$', line)
            if jur_match and len(jur_match.group(1)) == 3:  # 3-digit jurisdiction code
                current_jurisdiction = {
                    'code': jur_match.group(1),
                    'name': jur_match.group(2).strip(),
                    'budgeted': 0,
                    'executed': 0,
                    'subcategories': []
                }
                
            # Look for programmatic opening (e.g. "01.00.00 - Desarrallo politicas centrales")
            prog_match = re.match(r'^(\d+\.\d+\.\d+) - (.+)$', line)
            if prog_match:
                current_program = {
                    'code': prog_match.group(1),
                    'name': prog_match.group(2).strip(),
                    'budgeted': 0,
                    'executed': 0,
                    'items': []
                }
                
            # Look for budget items with financial data (e.g. "1.1.1.1 - Personal Superior 6.464.511,00 0,00 6.464.511,00 0,00 1.162.559,88 1.162.559,88 1.162.559,88 0,00")
            item_match = re.match(r'(\d+(?:\.\d+){3})\s*-\s*(.+?)\s+((?:\d+\.)*\d+,\d{2})\s+((?:\d+\.)*\d+,\d{2})\s+((?:\d+\.)*\d+,\d{2})\s+((?:\d+\.)*\d+,\d{2})\s+((?:\d+\.)*\d+,\d{2})\s+((?:\d+\.)*\d+,\d{2})\s+((?:\d+\.)*\d+,\d{2})\s+((?:\d+\.)*\d+,\d{2})', line)
            
            if item_match:
                code = item_match.group(1)
                name = item_match.group(2).strip()
                approved = float(item_match.group(3).replace('.', '').replace(',', '.'))
                modified = float(item_match.group(4).replace('.', '').replace(',', '.'))
                effective = float(item_match.group(5).replace('.', '').replace(',', '.'))
                available = float(item_match.group(6).replace('.', '').replace(',', '.'))
                committed = float(item_match.group(7).replace('.', '').replace(',', '.'))
                accrued = float(item_match.group(8).replace('.', '').replace(',', '.'))
                paid = float(item_match.group(9).replace('.', '').replace(',', '.'))
                unpaid = float(item_match.group(10).replace('.', '').replace(',', '.'))
                
                item = {
                    'code': code,
                    'name': name,
                    'budgeted': approved,
                    'executed': accrued,
                    'paid': paid,
                    'unpaid': unpaid,
                    'execution_rate': round((accrued / approved * 100), 2) if approved > 0 else 0
                }
                
                budget_data['subcategories'].append(item)
                
                # Update totals
                budget_data['summary']['total_budgeted'] += approved
                budget_data['summary']['total_executed'] += accrued
                
            i += 1
    
    # Calculate overall execution rate
    if budget_data['summary']['total_budgeted'] > 0:
        budget_data['summary']['execution_rate'] = round((budget_data['summary']['total_executed'] / budget_data['summary']['total_budgeted'] * 100), 2)
    else:
        budget_data['summary']['execution_rate'] = 0
        
    return budget_data

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 parse_budget_data.py <extracted_json_file>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    
    if not os.path.exists(json_file):
        print(f"File {json_file} does not exist")
        sys.exit(1)
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            pages_data = json.load(f)
            
        print(f"Parsing budget data from {json_file}...")
        
        # Parse detailed budget data
        detailed_data = parse_detailed_budget_data(pages_data)
        
        # Save to JSON file
        output_file = json_file.replace('_extracted.json', '_parsed.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(detailed_data, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"Detailed parsed data saved to {output_file}")
        
        # Print summary
        print("\n=== Summary ===")
        print(f"Period: {detailed_data['metadata']['period']}")
        print(f"Year: {detailed_data['metadata']['year']}")
        print(f"Jurisdiction: {detailed_data['metadata']['jurisdiction']}")
        print(f"Total Budgeted: ARS {detailed_data['summary']['total_budgeted']:,.2f}")
        print(f"Total Executed: ARS {detailed_data['summary']['total_executed']:,.2f}")
        print(f"Execution Rate: {detailed_data['summary']['execution_rate']}%")
        print(f"Items processed: {len(detailed_data['subcategories'])}")
        
        # Show top 5 budget items by amount
        top_items = sorted(detailed_data['subcategories'], key=lambda x: x['budgeted'], reverse=True)[:5]
        print("\n=== Top 5 Budget Items by Budgeted Amount ===")
        for item in top_items:
            print(f"{item['code']} {item['name']}: ARS {item['budgeted']:,.2f} (Executed: ARS {item['executed']:,.2f}, Rate: {item['execution_rate']}%)")
            
    except Exception as e:
        print(f"Error parsing data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
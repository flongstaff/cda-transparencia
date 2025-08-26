"""
This module contains functions for converting data to markdown format.
"""

import os
import json
from typing import Dict, Any, List
from jinja2 import Environment, FileSystemLoader

def _get_template(template_path: str):
    """
    Loads a Jinja2 template from the given path.
    """
    env = Environment(loader=FileSystemLoader(os.path.dirname(template_path)))
    return env.get_template(os.path.basename(template_path))

def convert_to_markdown(data: Dict[str, Any], template_path: str, output_path: str):
    """
    Converts data to markdown using a Jinja2 template.
    """
    try:
        template = _get_template(template_path)
        markdown_content = template.render(data)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
            
        return {'success': True, 'output_path': output_path}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def generate_markdown_table(headers: List[str], rows: List[List[Any]]) -> str:
    """
    Generates a markdown table from a list of headers and rows.
    """
    header_line = "| " + " | ".join(headers) + " |"
    separator_line = "| " + " | ".join(["---"] * len(headers)) + " |"
    
    row_lines = []
    for row in rows:
        row_lines.append("| " + " | ".join([str(item) for item in row]) + " |")
        
    return "\n".join([header_line, separator_line] + row_lines)

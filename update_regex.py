#!/usr/bin/env python3

import re

# Read the file
with open('/Users/flong/Developer/cda-transparencia/scripts/enhance-data-organization.sh', 'r') as file:
    content = file.read()

# Update the regex pattern to include financial report categories
content = re.sub(
    r"categoryMatch = filename\.match\(/\(\?:\^|_\)\(budget|contract|salary|treasury|debt|document|report|sef|presupuesto|contrato|sueldo|tesoreria|deuda|informe\)\(\?:_|\\\\\.\\$\)/i\);",
    "categoryMatch = filename.match(/(?:^|_)(budget|contract|salary|treasury|debt|document|report|sef|presupuesto|contrato|sueldo|tesoreria|deuda|informe|situacion|economico|financiera|financial)(?:_|\\\\\.\\$)/i);",
    content
)

# Write the file back
with open('/Users/flong/Developer/cda-transparencia/scripts/enhance-data-organization.sh', 'w') as file:
    file.write(content)

print("Regex pattern updated successfully!")
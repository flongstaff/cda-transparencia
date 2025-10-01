#!/usr/bin/env python3

# Read the file
with open('/Users/flong/Developer/cda-transparencia/scripts/enhance-data-organization.sh', 'r') as file:
    lines = file.readlines()

# Update the specific line (246th line - index 245)
if len(lines) >= 246:
    old_line = "    const categoryMatch = filename.match(/(?:^|_)(budget|contract|salary|treasury|debt|document|report|sef|presupuesto|contrato|sueldo|tesoreria|deuda|informe)(?:_|\\\\.|$)/i);\n"
    new_line = "    const categoryMatch = filename.match(/(?:^|_)(budget|contract|salary|treasury|debt|document|report|sef|presupuesto|contrato|sueldo|tesoreria|deuda|informe|situacion|economico|financiera|financial)(?:_|\\\\.|$)/i);\n"
    
    if lines[245] == old_line:
        lines[245] = new_line
        print("Line successfully updated")
    else:
        print("Line not found in expected format. Current content:")
        print(repr(lines[245]))
else:
    print("File doesn't have 246 lines")

# Write the file back
with open('/Users/flong/Developer/cda-transparencia/scripts/enhance-data-organization.sh', 'w') as file:
    file.writelines(lines)
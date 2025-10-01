#!/usr/bin/env python3

# Read the file
with open('/Users/flong/Developer/cda-transparencia/scripts/enhance-data-organization.sh', 'r') as file:
    lines = file.readlines()

# Update the specific line (246th line - index 245)
if len(lines) >= 246:
    content = lines[245]
    # Check if this line contains the target pattern
    if "const categoryMatch = filename.match" in content and "deuda|informe" in content:
        # Replace the pattern with the new one containing additional categories
        old_pattern = "deuda|informe"
        new_pattern = "deuda|informe|situacion|economico|financiera|financial"
        
        original_line = lines[245]
        lines[245] = lines[245].replace(old_pattern, new_pattern)
        
        if original_line != lines[245]:
            print("Line successfully updated")
        else:
            print("Line was not updated - replacement failed")
    else:
        print("Target pattern not found in expected line. Current content:")
        print(repr(content))
else:
    print("File doesn't have 246 lines")

# Write the file back
with open('/Users/flong/Developer/cda-transparencia/scripts/enhance-data-organization.sh', 'w') as file:
    file.writelines(lines)
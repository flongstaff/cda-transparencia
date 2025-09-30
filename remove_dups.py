#!/usr/bin/env python3

# Read the file as a list of lines
with open('/Users/flong/Developer/cda-transparencia/frontend/src/services/EnhancedDataService.ts', 'r') as f:
    lines = f.readlines()

# Print lines around the problematic area to see what needs to be removed
for i in range(670, min(len(lines), 680)):
    print(f"Line {i}: {repr(lines[i])}")

# Remove the duplicate lines (675 and 676 in the original numbering, which are indices 674 and 675 in 0-indexed)
# Check if they're the duplicate content
if (674 < len(lines) and 675 < len(lines) and 
    '// Return empty array as fallback' in lines[674] and
    lines[675].strip() == '}'):
    # Remove these duplicate lines
    del lines[674:676]  # Remove 2 lines starting from index 674

# Write the file back
with open('/Users/flong/Developer/cda-transparencia/frontend/src/services/EnhancedDataService.ts', 'w') as f:
    f.writelines(lines)

print("Removed duplicate lines!")
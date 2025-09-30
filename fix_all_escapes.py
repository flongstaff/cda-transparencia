#!/usr/bin/env python3

# Read the file
with open('/Users/flong/Developer/cda-transparencia/frontend/src/services/EnhancedDataService.ts', 'r') as f:
    content = f.read()

# Replace ALL literal backslash-n sequences with actual newlines
# Be careful to only do this for the problematic areas
content = content.replace('\\n', '\n')

# Write the file back
with open('/Users/flong/Developer/cda-transparencia/frontend/src/services/EnhancedDataService.ts', 'w') as f:
    f.write(content)

print("Replaced all escape sequences in the file!")
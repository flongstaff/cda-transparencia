import re

# Read the file
with open('src/tests/dark-mode-test.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the main escaped backticks that are causing parsing error
content = re.sub(r'console\.log\\`([^`]*)\\`;', 
                 r'console.log(`\1`);', 
                 content)

# Also fix the document.querySelector escaped template literals
content = re.sub(r'document\.querySelector\\`([^`]*)\\`', 
                 r'document.querySelector(`\1`)', 
                 content)

# Write the fixed content back
with open('src/tests/dark-mode-test.ts', 'w', encoding='utf-8') as f:
    f.write(content)
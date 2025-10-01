import re

# Read the file
with open('src/tests/dark-mode-test.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the escaped backticks
content = content.replace('console.log(\\\\`🔍 Testing ${testCase.component}...\\\\`);', 
                         'console.log(`🔍 Testing ${testCase.component}...`);')

# Write the fixed content back
with open('src/tests/dark-mode-test.ts', 'w', encoding='utf-8') as f:
    f.write(content)
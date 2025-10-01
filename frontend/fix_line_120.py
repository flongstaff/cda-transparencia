# Read the file
with open('src/tests/dark-mode-test.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the template literal with template expressions (this was already handled by the previous script, but add it again for safety)
content = content.replace('document.querySelector(\\`${className.replace(/\\\\s+/g, \'.\')}\\`)', 
                         'document.querySelector(`${className.replace(/\\\\s+/g, \'.\')}`)')

# Write the fixed content back
with open('src/tests/dark-mode-test.ts', 'w', encoding='utf-8') as f:
    f.write(content)
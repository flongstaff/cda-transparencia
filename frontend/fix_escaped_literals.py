# Read the file
with open('src/tests/dark-mode-test.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific problematic line
content = content.replace('console.log(\\`🔍 Testing ${testCase.component}...\\`);', 
                         'console.log(`🔍 Testing ${testCase.component}...`);')

# Also fix other similar patterns
content = content.replace('document.querySelector(\\`${className.replace(/\\\\s+/g, \'.\')}\\`)', 
                         'document.querySelector(`${className.replace(/\\\\s+/g, \'.\')}`)')

content = content.replace('console.log(\\`  ❌ Missing dark mode class: ${className}\\`);', 
                         'console.log(`  ❌ Missing dark mode class: ${className}`);')

content = content.replace('console.log(\\`  ❌ Missing light mode class: ${className}\\`);', 
                         'console.log(`  ❌ Missing light mode class: ${className}`);')

content = content.replace('console.log(\\`  ✅ ${testCase.component} has all required dark/light mode classes\\`);', 
                         'console.log(`  ✅ ${testCase.component} has all required dark/light mode classes`);')

content = content.replace('console.log(\\`  ⚠️  ${testCase.component} is missing some required classes\\`);', 
                         'console.log(`  ⚠️  ${testCase.component} is missing some required classes`);')

content = content.replace('console.log(\\`📊 Test Results: ${passedTests}/${totalTests} components passed dark mode class validation\\`);', 
                         'console.log(`📊 Test Results: ${passedTests}/${totalTests} components passed dark mode class validation`);')

content = content.replace('console.log(\\`✅ Found ${chartElements.length} chart elements\\`);', 
                         'console.log(`✅ Found ${chartElements.length} chart elements`);')

content = content.replace('console.log(\\`✅ Found ${tableElements.length} table elements\\`);', 
                         'console.log(`✅ Found ${tableElements.length} table elements`);')

content = content.replace('console.log(\\`${result ? \'✅\' : \'❌\'} ${testName}: ${result ? \'PASSED\' : \'FAILED\'}\\`);', 
                         'console.log(`${result ? \'✅\' : \'❌\'} ${testName}: ${result ? \'PASSED\' : \'FAILED\'}`);')

# Write the fixed content back
with open('src/tests/dark-mode-test.ts', 'w', encoding='utf-8') as f:
    f.write(content)
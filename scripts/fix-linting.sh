#!/bin/bash

# Linting Fix Script
# This script helps automate common linting fixes

echo "Running automated linting fixes..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

# Fix obvious issues with ESLint
echo "Running ESLint --fix..."
npx eslint . --fix

# Type check
echo "Running TypeScript type check..."
npx tsc --noEmit

echo "Automated fixes completed!"
echo ""
echo "Note: Some warnings may remain that require manual attention:"
echo "- @typescript-eslint/no-explicit-any (requires proper typing)"
echo "- @typescript-eslint/no-unused-vars (requires removing unused code)"
echo "- react-hooks/exhaustive-deps (requires understanding dependencies)"
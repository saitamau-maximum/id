#!/bin/bash

# Setup script for pre-commit hooks
echo "Setting up pre-commit hooks..."

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Make pre-commit hook executable
echo "Making pre-commit hook executable..."
chmod +x .husky/pre-commit

# Initialize husky (if not already done)
echo "Initializing husky..."
npx husky init

echo "Pre-commit hooks setup complete!"
echo ""
echo "How it works:"
echo "- When you commit files, husky will run the pre-commit hook"
echo "- The hook runs 'lint-staged' which processes only staged files"
echo "- Biome will automatically fix formatting and linting issues"
echo "- If there are unfixable issues, the commit will be blocked"
echo ""
echo "To test the setup, try:"
echo "1. Make some changes to a file"
echo "2. Stage the changes: git add ."
echo "3. Commit: git commit -m 'test: pre-commit hook'"
#!/bin/bash

# FonoSaaS Development Aliases Setup
# Run this to set up convenient aliases for development

echo "🚀 Setting up FonoSaaS development aliases..."

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Create aliases
echo ""
echo "📝 Add these aliases to your shell profile (~/.zshrc, ~/.bashrc, etc.):"
echo ""
echo "# FonoSaaS Development Aliases"
echo "alias bank!='cd $PROJECT_DIR && yarn bank!'"
echo "alias session='cd $PROJECT_DIR && yarn session:start'"
echo "alias session:status='cd $PROJECT_DIR && yarn session:status'"
echo "alias session:list='cd $PROJECT_DIR && yarn session:list'"
echo "alias session:insights='cd $PROJECT_DIR && yarn session:insights'"
echo "alias dev='cd $PROJECT_DIR && yarn dev:cursor'"
echo "alias build='cd $PROJECT_DIR && yarn build'"
echo "alias test='cd $PROJECT_DIR && yarn test'"
echo "alias lint='cd $PROJECT_DIR && yarn lint'"
echo ""

echo "🔧 To apply aliases immediately, run:"
echo "source ~/.zshrc  # or ~/.bashrc"
echo ""

echo "✅ Aliases ready! You can now use 'bank!' from anywhere to save your session."

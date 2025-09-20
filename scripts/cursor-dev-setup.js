#!/usr/bin/env node

/**
 * Cursor Development Setup Script
 * Enhances development experience with Cursor AI
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Cursor development environment for FonoSaaS...\n');

// Check if knowledge base exists
const knowledgeBasePath = path.join(__dirname, '../docs/knowledge-base');
if (!fs.existsSync(knowledgeBasePath)) {
  console.error('❌ Knowledge base not found! Please ensure docs/knowledge-base/ exists.');
  process.exit(1);
}

// Verify critical files exist
const criticalFiles = [
  '.cursor/context.md',
  '.cursor/rules/project-rules.md',
  '.cursor/workflows.md',
  '.cursor/templates.md',
  '.cursor/README.md',
  'docs/knowledge-base/index.md',
  'docs/knowledge-base/SUMMARY.md'
];

console.log('📋 Checking critical Cursor files...');
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
  }
});

// Check TypeScript configuration
console.log('\n🔧 Checking TypeScript configuration...');
const tsConfigPath = path.join(__dirname, '../tsconfig.json');
if (fs.existsSync(tsConfigPath)) {
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  if (tsConfig.compilerOptions?.strict) {
    console.log('✅ TypeScript strict mode enabled');
  } else {
    console.log('⚠️  TypeScript strict mode not enabled - recommended for FonoSaaS');
  }
} else {
  console.log('❌ tsconfig.json not found');
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredScripts = ['test', 'test:security', 'lint', 'type-check', 'build'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts?.[script]) {
      console.log(`✅ ${script}`);
    } else {
      console.log(`❌ ${script} - MISSING!`);
    }
  });
}

// Create Cursor-specific VS Code settings
console.log('\n⚙️  Creating Cursor-specific settings...');
const vscodeDir = path.join(__dirname, '../.vscode');
if (!fs.existsSync(vscodeDir)) {
  fs.mkdirSync(vscodeDir);
}

const cursorSettings = {
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "cursor.general.enableAutoComplete": true,
  "cursor.general.enableCodeActions": true,
  "cursor.general.enableInlineChat": true,
  "files.associations": {
    ".cursor/context.md": "markdown",
    ".cursor/rules/project-rules.md": "markdown",
    ".cursor/workflows.md": "markdown",
    ".cursor/templates.md": "markdown",
    ".cursor/README.md": "markdown"
  }
};

fs.writeFileSync(
  path.join(vscodeDir, 'settings.json'),
  JSON.stringify(cursorSettings, null, 2)
);
console.log('✅ Created .vscode/settings.json for Cursor optimization');

// Create Cursor-specific extensions recommendations
const extensions = {
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint"
  ]
};

fs.writeFileSync(
  path.join(vscodeDir, 'extensions.json'),
  JSON.stringify(extensions, null, 2)
);
console.log('✅ Created .vscode/extensions.json with recommended extensions');

console.log('\n🎉 Cursor development environment setup complete!');
console.log('\n📚 Next steps:');
console.log('1. Read the knowledge base: docs/knowledge-base/index.md');
console.log('2. Review cursor configuration: .cursor/README.md');
console.log('3. Check project rules: .cursor/rules/project-rules.md');
console.log('4. Review workflows: .cursor/workflows.md');
console.log('5. Use templates: .cursor/templates.md');
console.log('6. Start developing with enhanced Cursor AI assistance!');

console.log('\n🔍 Quick verification commands:');
console.log('yarn type-check  # Check TypeScript');
console.log('yarn lint        # Check code quality');
console.log('yarn test        # Run tests');
console.log('yarn build       # Verify build');

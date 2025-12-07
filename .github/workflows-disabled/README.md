# GitHub Actions Workflows - Simplified

This directory contains **3 simple, focused workflows** for the Almanaque da Fala application.

## 🎯 **Workflow Overview**

### 1. **CI Workflow** (`ci.yml`) - Testing & Quality
**Triggers:** Pull requests, pushes to develop/feature branches

**What it does:**
- Runs TypeScript compilation check
- Executes full test suite
- Performs code quality checks (ESLint, TODO/FIXME detection)
- **No deployment** - testing only

### 2. **CD Workflow** (`cd.yml`) - Production Deployment
**Triggers:** Push to main branch

**What it does:**
- Runs tests to ensure code quality
- Builds the application
- Deploys to Vercel production
- **Automatically creates release tags** (v1.5.0, v1.5.1, etc.)
- Sends deployment notifications

### 3. **Release Workflow** (`release.yml`) - Manual Releases
**Triggers:** Manual workflow dispatch

**What it does:**
- Creates manual releases when needed
- Supports patch, minor, major version bumps
- Allows custom version numbers
- **For special releases or hotfixes**

## 🚀 **How It Works**

### **Normal Development Flow:**
1. **Create feature branch** → CI runs tests
2. **Create pull request** → CI runs tests again
3. **Merge to main** → CD deploys to production + creates release tag

### **Manual Release Flow:**
1. **Go to Actions tab** → Click "Manual Release"
2. **Choose release type** (patch/minor/major) or custom version
3. **Add release notes** → Click "Run workflow"

## 📋 **Required Secrets**

Add these to your GitHub repository settings:

### **Vercel Secrets**
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID  
- `VERCEL_PROJECT_ID`: Your Vercel project ID

### **Application Secrets**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: Clerk sign-in URL
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: Clerk sign-up URL
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: Clerk after sign-in URL
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: Clerk after sign-up URL

### **AWS Secrets**
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `AWS_S3_BUCKET_NAME`: S3 bucket name

## ✅ **Benefits of This Setup**

- **Simple**: Only 3 workflows instead of 6
- **Clear**: Each workflow has one specific purpose
- **Reliable**: Tests run before every deployment
- **Automatic**: Release tags created automatically
- **Flexible**: Manual releases when needed
- **Maintainable**: Easy to understand and modify

## 🔧 **Troubleshooting**

### **CI Fails:**
- Check TypeScript errors: `yarn tsc --noEmit`
- Run tests locally: `yarn test`
- Fix ESLint issues: `yarn lint`

### **CD Fails:**
- Ensure all secrets are set correctly
- Check Vercel project configuration
- Verify build works locally: `yarn build`

### **Release Fails:**
- Check if version already exists
- Ensure you have push permissions
- Verify GitHub token permissions

## 🔐 **Required GitHub Secrets**

### **Vercel Deployment (Only these 3 are needed):**
- `VERCEL_TOKEN` - Token de autenticação do Vercel
- `VERCEL_ORG_ID` - ID da organização no Vercel
- `VERCEL_PROJECT_ID` - ID do projeto no Vercel

### **GitHub:**
- `GITHUB_TOKEN` (automatically provided)

## 🌐 **Environment Variables Management**

### **✅ Vercel (Production):**
- Todas as variáveis de ambiente de produção são gerenciadas pelo Vercel
- Clerk, Stripe, AWS, Database - tudo configurado no painel do Vercel
- **Não precisa duplicar no GitHub!**

### **🧪 GitHub Actions (Testing):**
- Usa valores mock para testes e validação de build
- Não acessa serviços reais durante CI/CD
- Foca apenas em validar código e estrutura

## 🧪 **Test Commands**

### **Available Test Scripts:**
- `yarn test` - Run core tests (excludes security tests)
- `yarn test:security` - Run only security tests (requires network)
- `yarn test:all` - Run all tests including security
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage report

### **Why Security Tests Are Excluded:**
Security tests require network requests to test against real servers, which don't work in CI environments. They're designed for manual testing when you have a running server.

## 📚 **Documentation Files**

- `BULLETPROOF-ANALYSIS.md`: Detailed analysis of the previous complex setup
- `RELEASE-SYSTEM.md`: Documentation of the automatic release system
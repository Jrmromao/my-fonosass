# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing, building, and deployment of the Almanaque da Fala application.

## Workflows

### 1. `deploy.yml` - Automatic Production Deployment
**Triggers:** Push to `main` branch, Pull requests to `main`

**What it does:**
- Runs all tests (unit, security, integration)
- Builds the application
- Deploys to Vercel production (only on push to main)
- Uploads test coverage reports

**Requirements:**
- All tests must pass
- Build must succeed
- Only deploys on direct push to main branch

### 2. `test.yml` - Pull Request Testing
**Triggers:** Pull requests to `main` or `develop`, Push to `develop` or `feature/*`

**What it does:**
- Runs complete test suite
- Uploads test results as artifacts
- Comments on PRs with test results
- Does NOT deploy

### 3. `manual-deploy.yml` - Manual Deployment
**Triggers:** Manual workflow dispatch

**What it does:**
- Runs all tests (can be skipped with input)
- Performs code quality checks (TODO/FIXME, console.log)
- Builds and deploys to specified environment
- Runs post-deployment verification

**Inputs:**
- `environment`: Choose between 'production' or 'staging'
- `skip_tests`: Option to skip tests (not recommended)

## Required Secrets

Add these secrets to your GitHub repository settings:

### Vercel Secrets
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

### Application Secrets
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: Clerk sign-in URL
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: Clerk sign-up URL
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: Clerk after sign-in URL
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: Clerk after sign-up URL

### AWS Secrets
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `AWS_S3_BUCKET_NAME`: S3 bucket name

## Test Coverage

The workflows run three types of tests:

1. **Unit Tests** (`yarn test`)
   - Component and function tests
   - Business logic validation
   - Coverage: `coverage/lcov.info`

2. **Security Tests** (`yarn test:security`)
   - Security vulnerability checks
   - Authentication and authorization tests
   - Coverage: `coverage/security/lcov.info`

3. **Integration Tests** (`yarn test:integration`)
   - API endpoint testing
   - Database integration tests
   - Coverage: `coverage/integration/lcov.info`

## Deployment Strategy

### Automatic Deployment
- **Trigger**: Push to `main` branch
- **Process**: Tests → Build → Deploy
- **Environment**: Production
- **Safety**: All tests must pass

### Manual Deployment
- **Trigger**: Manual workflow dispatch
- **Process**: Tests → Quality Checks → Build → Deploy
- **Environment**: Production or Staging
- **Safety**: Optional test skipping (not recommended)

### Pull Request Testing
- **Trigger**: Pull requests
- **Process**: Tests only
- **Environment**: None
- **Safety**: Prevents merging if tests fail

## Quality Gates

Before any deployment, the following must pass:

1. ✅ **Linting** - Code style and formatting
2. ✅ **Type Checking** - TypeScript compilation
3. ✅ **Unit Tests** - Component and function tests
4. ✅ **Security Tests** - Security vulnerability checks
5. ✅ **Integration Tests** - API and database tests
6. ✅ **Build** - Application compilation

## Monitoring

- Test results are uploaded as artifacts
- Coverage reports are sent to Codecov
- PR comments show test status
- Deployment notifications in workflow logs

## Troubleshooting

### Common Issues

1. **Tests Failing**
   - Check test logs in Actions tab
   - Run tests locally: `yarn test:all`
   - Fix failing tests before pushing

2. **Build Failing**
   - Check for TypeScript errors: `yarn type-check`
   - Verify all dependencies are installed
   - Check for missing environment variables

3. **Deployment Failing**
   - Verify Vercel secrets are set correctly
   - Check Vercel project configuration
   - Ensure all required environment variables are set

### Local Testing

Before pushing, run these commands locally:

```bash
# Run all tests
yarn test:all

# Check types
yarn type-check

# Lint code
yarn lint

# Build application
yarn build
```

## Best Practices

1. **Always run tests locally** before pushing
2. **Never skip tests** in production deployments
3. **Review PR test results** before merging
4. **Keep secrets secure** and rotate regularly
5. **Monitor deployment logs** for issues
6. **Use feature branches** for development
7. **Merge to main** only when ready for production

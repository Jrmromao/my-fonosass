# FonoSaaS Cursor Workflows

## 🚀 Development Workflows

### 1. Feature Development
```
1. Read knowledge base: docs/knowledge-base/index.md
2. Check existing patterns in codebase
3. Create feature branch
4. Implement with TypeScript strict mode
5. Add tests (unit + integration)
6. Run security tests
7. Validate LGPD compliance
8. Test build: yarn build
9. Create PR with detailed description
```

### 2. Bug Fix Workflow
```
1. Identify root cause using knowledge base
2. Check mistakes-and-solutions.md for similar issues
3. Fix with minimal changes
4. Add regression test
5. Run full test suite
6. Verify security compliance
7. Document fix in knowledge base
```

### 3. Security Review Workflow
```
1. Run: yarn test:security
2. Check: yarn security:audit
3. Validate input sanitization
4. Verify LGPD compliance
5. Test authentication flows
6. Review API endpoints
7. Check environment variables
```

## 🧠 AI Assistant Prompts

### For New Features
"Create a new feature for FonoSaaS following our established patterns. Check the knowledge base first, maintain LGPD compliance, use TypeScript strict mode, and ensure Portuguese language support."

### For Bug Fixes
"Fix this bug in FonoSaaS. First check our mistakes-and-solutions.md, maintain security standards, and ensure no LGPD compliance issues."

### For Code Review
"Review this code for FonoSaaS. Check for security issues, LGPD compliance, TypeScript best practices, and Brazilian market requirements."

## 🔍 Code Analysis Patterns

### Before Making Changes
- Always read: docs/knowledge-base/SUMMARY.md
- Check: docs/knowledge-base/mistakes-and-solutions.md
- Verify: Similar implementations in codebase
- Test: yarn build && yarn test:security

### Common Patterns to Follow
- Use API routes for client-side data fetching
- Implement Zod validation for all inputs
- Maintain Portuguese language consistency
- Follow Brazilian date/currency formats
- Ensure LGPD compliance in all features

# Codebase Architecture & Patterns

## Project: Almanaque da Fala - Speech Therapy Platform

### Architecture Patterns

#### Services Pattern
- Use Singleton pattern with `getInstance()` method
- Services in `/services/` directory
- Example: `S3Service.ts`, `PDFService.ts`, `userService.ts`

#### API Routes Structure
- Return consistent format: `{ success: boolean, data?: any, error?: string }`
- Use proper HTTP status codes
- Implement error handling middleware

#### Component Organization
```
/components/
  /ui/           # Reusable UI components (Radix UI based)
  /form/         # Form-specific components
  /layout/       # Layout components
  /dialogs/      # Modal/dialog components
  /table/        # Table components
  [Feature].tsx  # Feature-specific components
```

### Code Quality Standards

#### TypeScript
- Strict mode enabled
- No `any` types without explicit reasoning
- Use proper type definitions in `/types/`
- Prefer interfaces over types for object shapes

#### Testing Requirements
- Minimum 80% test coverage
- Unit tests for all services
- Integration tests for API routes
- Security tests in `__tests__/security/`
- Use Jest with jsdom for React components

#### Error Handling
- Comprehensive error boundaries
- Proper error logging
- User-friendly error messages
- Graceful degradation

### Medical/Healthcare Compliance
- Patient data must be handled securely
- HIPAA-like privacy considerations
- Audit trails for patient data access
- Secure file storage (AWS S3)

### Performance Standards
- Lazy loading for heavy components
- Image optimization
- Bundle size monitoring
- Database query optimization with Prisma

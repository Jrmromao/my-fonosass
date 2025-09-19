# Week 1 Integration Tests

## Overview
Integration tests for Week 1 MVP features covering the core exercise library functionality.

## Test Coverage

### ✅ UI Integration Tests
- **Landing Page**: Navigation and basic functionality
- **Exercise Library**: Table display and data loading
- **Exercise Preview**: Action buttons and preview functionality
- **Search & Filtering**: Phoneme and type filtering
- **Navigation**: Sidebar and page routing

### ✅ API Integration Tests
- **Exercise API**: GET /api/exercises endpoint
- **Search Functionality**: Query parameter filtering
- **Authentication**: Unauthorized request handling

## Running Tests

### Install Playwright
```bash
yarn add -D @playwright/test
npx playwright install
```

### Run All Integration Tests
```bash
yarn test:integration
```

### Run Week 1 Specific Tests
```bash
yarn test:week1
```

### Run Tests with UI
```bash
yarn test:integration:ui
```

## Test Scenarios

### 1. Exercise Library Display
- ✅ Shows exercises table
- ✅ Displays search input
- ✅ Shows filter tabs (Fonemas, Tipos)
- ✅ Loads seeded exercise data (10+ exercises)

### 2. Exercise Preview Functionality
- ✅ Shows action buttons (three dots)
- ✅ Opens dropdown menu
- ✅ Displays "Visualizar" option
- ✅ Shows exercise preview in alert

### 3. Search & Filtering
- ✅ Filters by phoneme (/p/, /k/, etc.)
- ✅ Filters by exercise type (ANIMALS, COLOURS, etc.)
- ✅ Searches by exercise name
- ✅ Handles empty search results

### 4. Navigation
- ✅ Sidebar navigation works
- ✅ Routes between dashboard sections
- ✅ Exercise page loads correctly

### 5. Data Integrity
- ✅ Shows seeded exercises
- ✅ Displays difficulty badges
- ✅ Shows exercise categories
- ✅ Handles API responses correctly

## Test Data Requirements

### Seeded Exercises
The tests expect the following seeded data:
- At least 10 exercises
- Exercises with phonemes: /p/, /k/, /t/, /r/, /f/, /s/, /v/, /l/, /m/, /n/
- Exercise types: ANIMALS, COLOURS, MEANS_OF_TRANSPORT, CLOTHING
- Difficulty levels: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- Specific exercises: "Exercício de Fonema /P/", "Cores e Sons /K/"

### API Endpoints
- `GET /api/exercises` - Returns exercise list
- `GET /api/exercises?search=term` - Filtered results
- `POST /api/exercises` - Requires authentication

## Success Criteria

### Week 1 MVP Complete When:
- ✅ All integration tests pass
- ✅ Exercise library displays correctly
- ✅ Preview functionality works
- ✅ Search and filtering functional
- ✅ Navigation between sections works
- ✅ API endpoints respond correctly

## Running Tests in CI/CD

```yaml
# GitHub Actions example
- name: Run Integration Tests
  run: |
    yarn db:seed
    yarn test:integration
```

## Troubleshooting

### Common Issues:
1. **Tests timeout**: Increase timeout in playwright.config.ts
2. **Data not loading**: Ensure database is seeded
3. **Auth issues**: Tests bypass authentication for MVP
4. **Element not found**: Check data-testid attributes

### Debug Commands:
```bash
# Run with debug mode
yarn test:integration --debug

# Run specific test
yarn test:integration --grep "should display exercises"

# Generate test report
yarn test:integration --reporter=html
```

## Next Steps (Week 2)
- Add subscription-based access tests
- Test file download functionality
- Add payment integration tests
- Test user role permissions

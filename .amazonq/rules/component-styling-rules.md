# Component-Specific Styling Rules

## Medical/Therapy Components

### Patient Management
```css
/* Patient list items */
.patient-list-item {
  @apply border-l-4 border-blue-500 bg-white p-4 shadow-sm hover:shadow-md transition-shadow;
}

/* Patient status indicators */
.status-active { @apply bg-green-100 text-green-800; }
.status-inactive { @apply bg-gray-100 text-gray-800; }
.status-pending { @apply bg-yellow-100 text-yellow-800; }
```

### Therapy Session Components
```css
/* Session cards */
.session-card {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6;
}

/* Progress indicators */
.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2;
}
.progress-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}
```

### Interactive Elements
```css
/* Balloon component styling */
.balloon-container {
  @apply relative inline-block cursor-pointer transition-transform hover:scale-105;
}

/* Clock component */
.clock-face {
  @apply bg-white border-4 border-gray-300 rounded-full shadow-lg;
}
```

### Form Components
```css
/* Medical form sections */
.form-section {
  @apply bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4;
}

/* Input groups */
.input-group {
  @apply space-y-2;
}

/* Validation states */
.input-error {
  @apply border-red-500 focus:ring-red-500;
}
.input-success {
  @apply border-green-500 focus:ring-green-500;
}
```

### Data Display
```css
/* Patient data tables */
.patient-table {
  @apply w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden;
}

/* Table headers */
.table-header {
  @apply bg-gray-50 text-gray-700 font-medium text-sm uppercase tracking-wider;
}

/* Table rows */
.table-row {
  @apply border-b border-gray-200 hover:bg-gray-50;
}
```

### Navigation & Layout
```css
/* Sidebar navigation */
.nav-sidebar {
  @apply bg-white border-r border-gray-200 h-full;
}

/* Main content area */
.main-content {
  @apply flex-1 bg-gray-50 p-6;
}

/* Header */
.app-header {
  @apply bg-white border-b border-gray-200 px-6 py-4;
}
```

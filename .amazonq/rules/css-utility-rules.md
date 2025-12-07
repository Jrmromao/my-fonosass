# CSS Utility & Component Styling Rules

## Tailwind CSS Standards

### Spacing System
- Use consistent spacing scale: `space-y-4`, `gap-6`, `p-4`
- Medical forms: `space-y-6` for field groups
- Patient cards: `p-6` for content areas
- Button spacing: `px-4 py-2` for standard buttons

### Layout Patterns
- Container: `max-w-7xl mx-auto px-4`
- Grid layouts: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Flex layouts: `flex items-center justify-between`

### Component Styling

#### Cards
```css
/* Patient cards */
.patient-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}

/* Medical data cards */
.medical-card {
  @apply bg-blue-50 border-blue-200 rounded-lg p-4;
}
```

#### Forms
```css
/* Medical form inputs */
.medical-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}

/* Required field indicators */
.required-field::after {
  content: "*";
  @apply text-red-500 ml-1;
}
```

### Color Usage
- Primary actions: `bg-blue-600 hover:bg-blue-700`
- Success states: `bg-green-600 text-white`
- Warning states: `bg-yellow-100 text-yellow-800`
- Error states: `bg-red-100 text-red-800`
- Patient data: `bg-gray-50 border-gray-200`

### Responsive Utilities
- Mobile: `sm:` prefix for 640px+
- Tablet: `md:` prefix for 768px+
- Desktop: `lg:` prefix for 1024px+
- Large screens: `xl:` prefix for 1280px+

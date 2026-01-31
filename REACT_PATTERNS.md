# Modern React Best Practices Implementation

This project implements modern React and Redux Toolkit best practices.

## Architecture Overview

### RTK Query for Data Fetching
- **No manual state management** - RTK Query handles loading, error, and cache states automatically
- **Normalized entity storage** - O(1) lookups by ID for both metadata and objects
- **Automatic caching** - Data is cached and reused across components
- **Automatic refetching** - Stale data is refetched in the background

### TypeScript Strict Mode
- Full type safety with `strict: true` in tsconfig.json
- No implicit `any` types
- Null safety enforced

### Error Handling
- **ErrorBoundary component** - Catches and displays React errors gracefully
- Custom fallback UI with retry functionality
- Console logging for debugging

### Suspense Support
- Suspense boundaries for loading states
- Ready for route-based code splitting with `React.lazy()`
- Cleaner loading UI patterns
- Note: RTK Query data fetching with Suspense coming in v2.x

## Usage Examples

### Basic Data Fetching
```tsx
import { useData } from './store';

function MyComponent() {
  const { metadata, objects, isLoading, error } = useData();
  
  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{/* Use metadata and objects */}</div>;
}
```

### Get Specific Object by ID (O(1) lookup)
```tsx
import { useObject, useMetadataFields } from './store';

function ObjectDetailPage({ objectId }: { objectId: string }) {
  const { fields } = useMetadataFields();
  const { object, isLoading } = useObject(objectId, fields);
  
  if (isLoading) return <LoadingIndicator />;
  
  return <div>{object?.['dcterms:title']}</div>;
}
```

### Filtered Objects (Memoized)
```tsx
import { useFilteredObjects, useMetadataFields } from './store';

function CoreCollectionList() {
  const { fields } = useMetadataFields();
  const { objects } = useFilteredObjects(
    (obj) => obj['dcterms:Collection'] === 'Core',
    fields
  );
  
  return <ObjectList objects={objects} />;
}
```

### With Suspense and ErrorBoundary
```tsx
import { Suspense } from 'react';
import { ErrorBoundary } from './store';
import LoadingIndicator from './components/LoadingIndicator';

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingIndicator />}>
        {/* Ready for React.lazy() components */}
        <MyRouteComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Available Hooks

### Data Fetching
- `useData()` - Fetch metadata and objects sequentially

### Metadata Selectors
- `useMetadataFields()` - Get all metadata fields
- `useMetadataField(name)` - Get specific field by name

### Object Selectors
- `useObjects(metadata)` - Get all objects (sorted by title)
- `useObject(id, metadata)` - Get specific object by ID
- `useObjectCount(metadata)` - Get total object count
- `useObjectsSample(count, metadata)` - Get first N objects
- `useFilteredObjects(predicate, metadata)` - Filter with custom function

## Performance Features

### Normalized State
Objects stored as:
```typescript
{
  ids: ['MOO-001', 'MOO-002', ...],
  entities: {
    'MOO-001': { /* object data */ },
    'MOO-002': { /* object data */ },
  }
}
```
This enables O(1) lookups instead of O(n) array searches.

### Automatic Memoization
All selectors use RTK Query's `selectFromResult` for automatic memoization:
- Only re-render when selected data actually changes
- No manual `useMemo` needed
- Optimized by default

### Automatic Sorting
- Metadata: Sorted alphabetically by field name
- Objects: Sorted alphabetically by title

## Code Organization

```
src/
├── components/
│   └── ErrorBoundary.tsx       # Error boundary component
├── hooks/
│   ├── useData.ts              # Sequential data fetching
│   └── useSelectors.ts         # Memoized selector hooks
└── store/
    ├── api.ts                  # RTK Query API definition
    ├── store.ts                # Redux store configuration
    └── index.ts                # Centralized exports
```

## Benefits Summary

✅ **~300 lines of boilerplate eliminated** (vs manual Redux slices)  
✅ **O(1) lookups** for objects and metadata by ID  
✅ **Automatic caching** - no refetching unless needed  
✅ **Type-safe** with TypeScript strict mode  
✅ **Error handling** with ErrorBoundary  
✅ **Suspense support** for cleaner loading states  
✅ **Memoized selectors** prevent unnecessary re-renders  
✅ **Automatic sorting** for consistent ordering  

## Future Enhancements

- Route-based code splitting with `React.lazy()`
- Prefetching on hover/navigation for instant page loads
- Optimistic updates for faster perceived performance
- Background refetching strategies
- React Suspense for data fetching (when RTK Query v2.x adds official support)

# ClassSync Project Architecture Guide

## Tech Stack Overview

ClassSync is a GPS-based attendance management system built with:

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Convex (real-time database with serverless functions)
- **Routing**: TanStack Router with file-based routing
- **Styling**: Tailwind CSS v4 + Radix UI components
- **State Management**: TanStack Query + Convex React integration
- **Authentication**: Better Auth with Convex integration
- **Forms**: React Hook Form + Zod/Valibot validation
- **UI Components**: Custom components built on Radix UI primitives

## Project Structure

```
src/
├── components/          # Reusable UI components
├── feature/            # Feature-based modules
│   ├── lecturer/       # Lecturer-specific components and logic
│   ├── student/        # Student-specific components and logic
│   └── attendance/     # Attendance-related shared logic
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
├── routes/             # TanStack Router route definitions
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

convex/
├── schema.ts           # Database schema definitions
├── *.ts               # Convex functions (queries, mutations, actions)
└── _generated/        # Auto-generated Convex types
```

## Key Architectural Principles

### 1. Feature-Based Organization

- Group related components, hooks, and logic by feature
- Each feature module should be self-contained
- Shared logic goes in appropriate top-level directories

### 2. Server-First Approach

- All business logic and state management happens in Convex
- Client components are primarily for UI and user interaction
- Use Convex queries for real-time data synchronization

### 3. Type Safety

- Leverage TypeScript throughout the application
- Use Convex's generated types for database operations
- Validate forms with Zod or Valibot schemas

### 4. Component Composition

- Build complex UIs by composing smaller, focused components
- Use Radix UI primitives for accessibility and consistency
- Follow the compound component pattern where appropriate

## Development Guidelines

### File Naming Conventions

- Components: PascalCase (e.g., `AttendanceSessionModal.tsx`)
- Hooks: camelCase starting with 'use' (e.g., `useAttendanceSession.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase with descriptive suffixes (e.g., `AttendanceSessionType.ts`)

### Import Organization

1. React and external libraries
2. Internal components and hooks
3. Types and interfaces
4. Relative imports

### Component Structure

```tsx
// External imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Internal imports
import { useAttendanceSession } from '@/hooks/useAttendanceSession';

// Types
interface ComponentProps {
  // props definition
}

// Component implementation
const Component = ({ ...props }: ComponentProps) => {
  // Component logic
  return (
    // JSX
  );
};

export default Component;
```

## Performance Considerations

### 1. Convex Query Optimization

- Use specific queries rather than fetching all data
- Implement proper indexing in schema.ts
- Leverage Convex's built-in caching and reactivity

### 2. Component Optimization

- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid unnecessary re-renders with useCallback and useMemo

### 3. Bundle Optimization

- Use dynamic imports for route-based code splitting
- Optimize images and assets
- Tree-shake unused dependencies

## Security Best Practices

### 1. Data Validation

- Validate all inputs on both client and server
- Use TypeScript for compile-time type checking
- Implement runtime validation with Zod/Valibot

### 2. Authentication & Authorization

- Implement proper role-based access control
- Validate user permissions in Convex functions
- Protect sensitive routes and components

### 3. Data Privacy

- Sanitize user inputs
- Implement proper error handling without exposing sensitive information
- Follow GDPR/privacy compliance guidelines

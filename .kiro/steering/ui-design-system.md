# UI Design System Guide for ClassSync

## Design Principles

### 1. Consistency

- Use consistent spacing, typography, and color schemes throughout the application
- Follow established patterns for similar UI elements
- Maintain consistent interaction patterns (hover states, focus states, etc.)

### 2. Accessibility First

- Ensure all components meet WCAG 2.1 AA standards
- Provide proper ARIA labels and roles
- Support keyboard navigation
- Maintain sufficient color contrast ratios

### 3. Mobile-First Responsive Design

- Design for mobile devices first, then enhance for larger screens
- Use responsive breakpoints consistently
- Ensure touch targets are appropriately sized (minimum 44px)

## Component Library Structure

### Base Components (Radix UI + Custom Styling)

```tsx
// components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
```

### Composite Components

Build complex components by composing base components.

```tsx
// components/attendance/AttendanceSessionCard.tsx
const AttendanceSessionCard = ({ session }: { session: AttendanceSession }) => (
  <Card className="w-full max-w-md">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">{session.courseName}</CardTitle>
        <SessionStatusBadge status={session.status} />
      </div>
      <CardDescription>Session ID: {session.id.slice(-8)}</CardDescription>
    </CardHeader>

    <CardContent className="space-y-4">
      <SessionTimer endTime={session.endTime} />
      <AttendeeCount count={session.attendeeCount} />

      {session.requiresCode && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Code className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-mono">{session.code}</span>
        </div>
      )}
    </CardContent>

    <CardFooter className="pt-3">
      <SessionActions session={session} />
    </CardFooter>
  </Card>
);
```

## Color System

### Primary Colors

```css
:root {
  /* Primary brand colors */
  --primary: 220 90% 56%; /* Blue primary */
  --primary-foreground: 0 0% 100%; /* White text on primary */

  /* Secondary colors */
  --secondary: 220 14% 96%; /* Light gray */
  --secondary-foreground: 220 9% 46%; /* Dark gray text */

  /* Accent colors */
  --accent: 220 14% 96%;
  --accent-foreground: 220 9% 46%;
}
```

### Status Colors

```css
:root {
  /* Success states */
  --success: 142 76% 36%; /* Green */
  --success-foreground: 0 0% 100%;

  /* Warning states */
  --warning: 38 92% 50%; /* Orange */
  --warning-foreground: 0 0% 100%;

  /* Error/Destructive states */
  --destructive: 0 84% 60%; /* Red */
  --destructive-foreground: 0 0% 100%;

  /* Info states */
  --info: 217 91% 60%; /* Blue */
  --info-foreground: 0 0% 100%;
}
```

### Attendance-Specific Colors

```css
:root {
  /* Session status colors */
  --session-pending: 43 96% 56%; /* Yellow - preparation phase */
  --session-active: 142 76% 36%; /* Green - active check-in */
  --session-inactive: 220 9% 46%; /* Gray - ended session */

  /* Attendance status colors */
  --present: 142 76% 36%; /* Green - student present */
  --late: 38 92% 50%; /* Orange - student late */
  --absent: 0 84% 60%; /* Red - student absent */
}
```

## Typography Scale

### Font Families

```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Type Scale

```tsx
// Typography component variants
const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
      p: 'leading-7 [&:not(:first-child)]:mt-6',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
      code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});
```

## Spacing System

### Consistent Spacing Scale

```css
/* Tailwind spacing scale (rem values) */
.space-1 {
  margin: 0.25rem;
} /* 4px */
.space-2 {
  margin: 0.5rem;
} /* 8px */
.space-3 {
  margin: 0.75rem;
} /* 12px */
.space-4 {
  margin: 1rem;
} /* 16px */
.space-6 {
  margin: 1.5rem;
} /* 24px */
.space-8 {
  margin: 2rem;
} /* 32px */
.space-12 {
  margin: 3rem;
} /* 48px */
.space-16 {
  margin: 4rem;
} /* 64px */
```

### Layout Spacing Guidelines

- **Component padding**: Use `p-4` (16px) for standard component padding
- **Section spacing**: Use `space-y-6` (24px) between major sections
- **Element spacing**: Use `space-y-4` (16px) between related elements
- **Tight spacing**: Use `space-y-2` (8px) for closely related items

## Component Patterns

### Status Indicators

```tsx
const SessionStatusBadge = ({ status }: { status: SessionStatus }) => {
  const variants = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <Badge className={cn('border', variants[status])}>
      <StatusIcon status={status} className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
```

### Loading States

```tsx
const AttendanceSessionSkeleton = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);
```

### Empty States

```tsx
const EmptyAttendanceHistory = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <ClockIcon className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No attendance sessions yet</h3>
    <p className="text-muted-foreground mb-6 max-w-sm">
      Start your first attendance session to begin tracking student
      participation.
    </p>
    <Button onClick={onCreateSession}>
      <Plus className="h-4 w-4 mr-2" />
      Create Session
    </Button>
  </div>
);
```

## Responsive Design Patterns

### Breakpoints

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Responsive Component Example

```tsx
const AttendanceDashboard = () => (
  <div className="container mx-auto px-4 py-6">
    {/* Mobile: Stack vertically, Desktop: Side by side */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ActiveSessionsGrid />
      </div>
      <div className="space-y-6">
        <QuickStats />
        <RecentActivity />
      </div>
    </div>
  </div>
);
```

## Animation and Transitions

### Consistent Transition Timing

```css
:root {
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}
```

### Common Animation Patterns

```tsx
// Fade in animation for new content
const FadeIn = ({ children, delay = 0 }: FadeInProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    {children}
  </motion.div>
);

// Slide in animation for modals
const SlideIn = ({ children }: SlideInProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);
```

## Form Design Patterns

### Consistent Form Layout

```tsx
const AttendanceSessionForm = () => (
  <form className="space-y-6">
    <div className="space-y-4">
      <FormField
        name="courseName"
        label="Course Name"
        placeholder="Enter course name"
        required
      />

      <FormField
        name="duration"
        label="Session Duration"
        type="select"
        options={durationOptions}
      />

      <div className="flex items-center space-x-2">
        <Switch id="require-code" />
        <Label htmlFor="require-code">Require attendance code</Label>
      </div>
    </div>

    <div className="flex gap-3 pt-4">
      <Button type="button" variant="outline" className="flex-1">
        Cancel
      </Button>
      <Button type="submit" className="flex-1">
        Create Session
      </Button>
    </div>
  </form>
);
```

### Form Validation States

```tsx
const FormField = ({ error, ...props }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={props.name}>{props.label}</Label>
    <Input
      {...props}
      className={cn(
        'transition-colors',
        error && 'border-destructive focus:border-destructive',
      )}
    />
    {error && (
      <p className="text-sm text-destructive flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        {error}
      </p>
    )}
  </div>
);
```

## Accessibility Guidelines

### Focus Management

```tsx
// Ensure proper focus management in modals
const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={modalRef} tabIndex={-1}>
        {children}
      </DialogContent>
    </Dialog>
  );
};
```

### Screen Reader Support

```tsx
const AttendanceTimer = ({ endTime }: { endTime: number }) => {
  const timeRemaining = useTimeRemaining(endTime);

  return (
    <div role="timer" aria-live="polite">
      <span className="sr-only">Time remaining: </span>
      <span className="text-2xl font-mono">{formatTime(timeRemaining)}</span>
    </div>
  );
};
```

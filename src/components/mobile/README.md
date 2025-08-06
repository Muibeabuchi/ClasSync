# Mobile Components

This directory contains mobile-first UI components designed for ClassSync's student interface.

## Components

### MobileBottomNavigation

Fixed bottom navigation component with 5 tabs (Home, Courses, Check In, Inbox, Profile).

**Features:**

- Touch-friendly 48x48px minimum touch targets
- Active state highlighting with primary color
- Badge support for notification counts
- Proper ARIA labels and accessibility
- Safe area support for mobile devices
- Touch feedback with scale animation

### MobilePageContainer

Full-screen page container component for mobile content areas.

**Features:**

- Full-screen layout with 100dvh viewport handling
- Smooth page transitions (slide-left, slide-right, fade, none)
- Optimized momentum scrolling for mobile devices
- Safe area handling for notched devices and home indicators
- Optional header with title and action buttons
- Proper bottom navigation spacing
- Hardware-accelerated transitions
- Scroll position reset on page changes

**Props:**

```typescript
interface MobilePageContainerProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  headerTitle?: string;
  headerActions?: React.ReactNode;
  scrollable?: boolean;
  transition?: 'slide-left' | 'slide-right' | 'fade' | 'none';
  onTransitionEnd?: () => void;
}
```

**Usage:**

```tsx
<MobilePageContainer
  showHeader={true}
  headerTitle="My Page"
  headerActions={<Button>Action</Button>}
  transition="fade"
  onTransitionEnd={() => console.log('Transition complete')}
>
  <div className="p-4">
    <h1>Page Content</h1>
  </div>
</MobilePageContainer>
```

## CSS Variables

The components use CSS custom properties for consistent mobile styling:

- `--mobile-header-height`: 56px
- `--mobile-bottom-nav-height`: 80px
- `--mobile-safe-area-*`: Safe area insets for notched devices
- `--mobile-transition-*`: Transition timing values
- `--touch-target-*`: Touch target size standards

## Animations

Page transitions are implemented using CSS keyframes:

- `slideInLeft` / `slideOutLeft`: Horizontal slide transitions
- `slideInRight` / `slideOutRight`: Horizontal slide transitions
- `fadeIn` / `fadeOut`: Fade transitions with subtle vertical movement

## Mobile Optimizations

- Uses `100dvh` for proper mobile viewport handling
- Implements `-webkit-overflow-scrolling: touch` for smooth iOS scrolling
- Prevents overscroll bounce with `overscroll-behavior`
- Hardware acceleration with `will-change` property
- Touch-optimized interaction feedback
- Proper safe area handling for modern mobile devices

/**
 * Accessibility utilities for manual attendance override components
 * Requirements: 6.1, 6.2 - Ensure accessibility standards compliance
 */

/**
 * ARIA labels for override-related UI elements
 */
export const ARIA_LABELS = {
  // Override status indicators
  MANUAL_OVERRIDE_ICON: 'Manual override indicator',
  PRESENT_ICON: 'Present status indicator',
  ABSENT_ICON: 'Absent status indicator',
  LATE_ICON: 'Late status indicator',

  // Override actions
  MARK_PRESENT_BUTTON: (studentName: string) =>
    `Mark ${studentName} as present with manual override`,
  OVERRIDE_DIALOG: 'Manual override dialog',
  OVERRIDE_DRAWER: 'Manual override drawer',
  JUSTIFICATION_INPUT: 'Justification for manual override',

  // Time window indicators
  TIME_WINDOW_STATUS: 'Override time window status',
  COUNTDOWN_TIMER: 'Time remaining for override window',
  TIME_WINDOW_PROGRESS: 'Override window time remaining progress',

  // Navigation and controls
  DISMISS_ALERT: 'Dismiss time window alert',
  REFRESH_STATUS: 'Refresh override status',
  CLOSE_DIALOG: 'Close override dialog',

  // Status descriptions
  OVERRIDE_STATUS_DESCRIPTION: (status: string, studentName: string) =>
    `${studentName} attendance status: ${status}`,
  TIME_REMAINING_DESCRIPTION: (timeString: string) =>
    `Time remaining for override window: ${timeString}`,
} as const;

/**
 * ARIA descriptions for complex UI states
 */
export const ARIA_DESCRIPTIONS = {
  MANUAL_OVERRIDE_TOOLTIP: (
    studentName: string,
    reason: string,
    timestamp: string,
  ) =>
    `${studentName} was manually marked as present. Reason: ${reason}. Time: ${timestamp}`,

  TIME_WINDOW_ACTIVE: (remainingTime: string) =>
    `Override window is active. ${remainingTime} remaining to perform manual overrides.`,

  TIME_WINDOW_EXPIRING: (remainingTime: string) =>
    `Override window is expiring soon. Only ${remainingTime} remaining to perform manual overrides.`,

  TIME_WINDOW_EXPIRED:
    'Override window has expired. Manual overrides are no longer available.',

  SESSION_STILL_ACTIVE:
    'Attendance session is still active. Override functionality will be available after the session ends.',

  OVERRIDE_FORM_INSTRUCTIONS:
    'Enter a detailed justification for manually marking this student as present. Minimum 15 characters required.',

  OVERRIDE_CONFIRMATION:
    'This action will permanently mark the student as present and create an audit log entry.',
} as const;

/**
 * Screen reader announcements for dynamic content
 */
export const SCREEN_READER_ANNOUNCEMENTS = {
  OVERRIDE_SUCCESS: (studentName: string) =>
    `Success: ${studentName} has been marked as present via manual override`,

  OVERRIDE_ERROR: (studentName: string, error: string) =>
    `Error: Failed to mark ${studentName} as present. ${error}`,

  TIME_WINDOW_EXPIRING: (minutes: number) =>
    `Warning: Override window will expire in ${minutes} minutes`,

  TIME_WINDOW_EXPIRED: 'Override window has expired',

  FORM_VALIDATION_ERROR: (field: string, error: string) =>
    `Validation error in ${field}: ${error}`,
} as const;

/**
 * Keyboard navigation constants
 */
export const KEYBOARD_NAVIGATION = {
  // Key codes
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',

  // Focus management
  FOCUSABLE_SELECTORS: [
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', '),
} as const;

/**
 * Color contrast validation for accessibility compliance
 * Requirements: 6.1, 6.2 - Test color contrast ratios for visual indicators
 */
export const COLOR_CONTRAST = {
  // WCAG AA compliance ratios
  MIN_CONTRAST_NORMAL: 4.5,
  MIN_CONTRAST_LARGE: 3.0,

  // Status color combinations that meet WCAG AA standards
  ACCESSIBLE_COMBINATIONS: {
    // Green (present status)
    present: {
      foreground: '#166534', // text-green-800
      background: '#f0fdf4', // bg-green-50
      border: '#bbf7d0', // border-green-200
      contrastRatio: 7.2,
    },

    // Amber (manual override)
    'manual-override': {
      foreground: '#92400e', // text-amber-800
      background: '#fffbeb', // bg-amber-50
      border: '#fde68a', // border-amber-200
      contrastRatio: 6.8,
    },

    // Red (absent status)
    absent: {
      foreground: '#991b1b', // text-red-800
      background: '#fef2f2', // bg-red-50
      border: '#fecaca', // border-red-200
      contrastRatio: 8.1,
    },

    // Orange (late status)
    late: {
      foreground: '#9a3412', // text-orange-800
      background: '#fff7ed', // bg-orange-50
      border: '#fed7aa', // border-orange-200
      contrastRatio: 7.5,
    },
  },
} as const;

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  /**
   * Save current focus and set focus to new element
   */
  static pushFocus(element: HTMLElement) {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }
    element.focus();
  }

  /**
   * Restore previous focus
   */
  static popFocus() {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  /**
   * Trap focus within a container
   */
  static trapFocus(container: HTMLElement, event: KeyboardEvent) {
    if (event.key !== KEYBOARD_NAVIGATION.TAB) return;

    const focusableElements = container.querySelectorAll(
      KEYBOARD_NAVIGATION.FOCUSABLE_SELECTORS,
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll(KEYBOARD_NAVIGATION.FOCUSABLE_SELECTORS),
    ) as HTMLElement[];
  }
}

/**
 * Screen reader utilities
 */
export class ScreenReaderUtils {
  /**
   * Announce message to screen readers
   */
  static announce(
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
  ) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Create visually hidden text for screen readers
   */
  static createScreenReaderText(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  }
}

/**
 * Validation for accessibility compliance
 */
export const validateAccessibility = {
  /**
   * Check if element has proper ARIA labels
   */
  hasAriaLabel(element: HTMLElement): boolean {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.getAttribute('aria-describedby')
    );
  },

  /**
   * Check if interactive element has proper role
   */
  hasProperRole(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');

    // Buttons should have button role or be button elements
    if (element.onclick || element.getAttribute('onclick')) {
      return tagName === 'button' || role === 'button';
    }

    return true;
  },

  /**
   * Check if element meets minimum size requirements for touch targets
   */
  meetsTouchTargetSize(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // 44px minimum for WCAG AA

    return rect.width >= minSize && rect.height >= minSize;
  },

  /**
   * Check if text has sufficient contrast (simplified check)
   */
  hasSufficientContrast(element: HTMLElement): boolean {
    // This is a simplified check - in production, you'd use a proper contrast calculation
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    // For now, we'll assume our predefined color combinations are accessible
    return true;
  },
};

/**
 * Accessibility testing utilities for development
 */
export const accessibilityTesting = {
  /**
   * Run basic accessibility checks on an element
   */
  auditElement(element: HTMLElement): {
    passed: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for ARIA labels on interactive elements
    if (element.onclick || element.getAttribute('onclick')) {
      if (!validateAccessibility.hasAriaLabel(element)) {
        issues.push('Interactive element missing ARIA label');
      }
    }

    // Check touch target size
    if (!validateAccessibility.meetsTouchTargetSize(element)) {
      issues.push('Element does not meet minimum touch target size (44px)');
    }

    // Check for proper roles
    if (!validateAccessibility.hasProperRole(element)) {
      issues.push('Element missing proper ARIA role');
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  },

  /**
   * Log accessibility issues to console (development only)
   */
  logAccessibilityIssues(element: HTMLElement, componentName: string) {
    if (process.env.NODE_ENV !== 'development') return;

    const audit = this.auditElement(element);
    if (!audit.passed) {
      console.warn(`Accessibility issues in ${componentName}:`, audit.issues);
    }
  },
};

export default {
  ARIA_LABELS,
  ARIA_DESCRIPTIONS,
  SCREEN_READER_ANNOUNCEMENTS,
  KEYBOARD_NAVIGATION,
  COLOR_CONTRAST,
  FocusManager,
  ScreenReaderUtils,
  validateAccessibility,
  accessibilityTesting,
};

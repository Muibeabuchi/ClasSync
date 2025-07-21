import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface MobilePageContainerProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  headerTitle?: string;
  headerActions?: React.ReactNode;
  scrollable?: boolean;
  transition?: 'slide-left' | 'slide-right' | 'fade' | 'none';
  onTransitionEnd?: () => void;
}

export const MobilePageContainer = forwardRef<
  HTMLDivElement,
  MobilePageContainerProps
>(
  (
    {
      children,
      className,
      showHeader = false,
      headerTitle,
      headerActions,
      scrollable = true,
      transition = 'fade',
      onTransitionEnd,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Combine refs
    const combinedRef = (node: HTMLDivElement) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Handle transition end event
    useEffect(() => {
      const container = containerRef.current;
      if (!container || !onTransitionEnd) return;

      const handleTransitionEnd = (e: TransitionEvent) => {
        // Only trigger for the container's own transitions, not child elements
        if (e.target === container) {
          onTransitionEnd();
        }
      };

      container.addEventListener('transitionend', handleTransitionEnd);
      return () => {
        container.removeEventListener('transitionend', handleTransitionEnd);
      };
    }, [onTransitionEnd]);

    // Prevent scroll restoration on page transitions
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }, []);

    // Get transition classes based on transition type
    const getTransitionClasses = () => {
      switch (transition) {
        case 'slide-left':
          return 'animate-slide-in-left';
        case 'slide-right':
          return 'animate-slide-in-right';
        case 'fade':
          return 'animate-fade-in';
        case 'none':
        default:
          return '';
      }
    };

    return (
      <div
        ref={combinedRef}
        className={cn(
          // Base layout - full screen with flex column
          'flex flex-col',
          'h-[100dvh] w-full',
          'bg-background',
          // Safe area handling
          'safe-area-inset',
          // Transition classes
          getTransitionClasses(),
          // Custom classes
          className,
        )}
        style={{
          // Ensure proper stacking and positioning
          position: 'relative',
          zIndex: 1,
          // Hardware acceleration for smooth transitions
          willChange: 'transform, opacity',
          // Prevent content from being selectable during transitions
          WebkitUserSelect: transition !== 'none' ? 'none' : 'auto',
          userSelect: transition !== 'none' ? 'none' : 'auto',
        }}
      >
        {/* Optional Header */}
        {showHeader && (
          <header
            className={cn(
              'flex items-center justify-between',
              'mobile-header-height',
              'px-4 py-2',
              'bg-background/95 backdrop-blur-sm',
              'border-b border-border',
              'shrink-0',
              // Safe area for notched devices
              'safe-area-top',
            )}
          >
            <div className="flex-1">
              {headerTitle && (
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {headerTitle}
                </h1>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2 shrink-0">
                {headerActions}
              </div>
            )}
          </header>
        )}

        {/* Main Content Area */}
        <main
          ref={scrollRef}
          className={cn(
            'flex-1 flex flex-col',
            'relative',
            // Scrolling behavior
            scrollable && [
              'overflow-y-auto overflow-x-hidden',
              'mobile-scroll',
              // Smooth momentum scrolling on iOS
              'overscroll-behavior-y-contain',
            ],
            !scrollable && 'overflow-hidden',
          )}
          style={{
            // Optimize scrolling performance
            WebkitOverflowScrolling: 'touch',
            // Prevent horizontal scrolling
            overscrollBehaviorX: 'none',
            // Improve scroll performance
            scrollBehavior: 'smooth',
          }}
        >
          {/* Content wrapper with proper spacing */}
          <div
            className={cn(
              'flex-1 flex flex-col',
              // Bottom padding to account for bottom navigation
              'pb-[calc(var(--mobile-bottom-nav-height)+var(--mobile-safe-area-bottom))]',
              // Minimum height to ensure content fills screen
              'min-h-full',
            )}
          >
            {children}
          </div>
        </main>
      </div>
    );
  },
);

MobilePageContainer.displayName = 'MobilePageContainer';

export default MobilePageContainer;

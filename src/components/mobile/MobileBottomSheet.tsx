import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface MobileBottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
  showDragHandle?: boolean;
  snapPoints?: number[];
  initialSnapPoint?: number;
  onSnapPointChange?: (snapPoint: number) => void;
  swipeToClose?: boolean;
  backdropDismiss?: boolean;
  preventScrollClose?: boolean;
}

export const MobileBottomSheet = forwardRef<
  HTMLDivElement,
  MobileBottomSheetProps
>(
  (
    {
      children,
      isOpen,
      onClose,
      title,
      description,
      className,
      contentClassName,
      showCloseButton = true,
      showDragHandle = true,
      snapPoints = [0.5, 0.8],
      initialSnapPoint = 0,
      onSnapPointChange,
      swipeToClose = true,
      backdropDismiss = true,
      preventScrollClose = false,
    },
    ref,
  ) => {
    const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(0);
    const [dragCurrentY, setDragCurrentY] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const sheetRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    // Combine refs
    const combinedRef = (node: HTMLDivElement) => {
      sheetRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Calculate sheet height based on snap point
    const getSheetHeight = (snapPoint: number) => {
      if (snapPoints[snapPoint] !== undefined) {
        return `${snapPoints[snapPoint] * 100}vh`;
      }
      return '50vh';
    };

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (backdropDismiss && e.target === backdropRef.current) {
        onClose();
      }
    };

    // Handle drag start
    const handleDragStart = (clientY: number) => {
      if (!swipeToClose) return;

      setIsDragging(true);
      setDragStartY(clientY);
      setDragCurrentY(clientY);

      // Prevent body scroll during drag
      document.body.style.overflow = 'hidden';
    };

    // Handle drag move
    const handleDragMove = (clientY: number) => {
      if (!isDragging || !swipeToClose) return;

      setDragCurrentY(clientY);

      const deltaY = clientY - dragStartY;
      const sheet = sheetRef.current;

      if (sheet && deltaY > 0) {
        // Only allow dragging down
        sheet.style.transform = `translateY(${deltaY}px)`;

        // Update backdrop opacity based on drag distance
        const backdrop = backdropRef.current;
        if (backdrop) {
          const maxDrag = window.innerHeight * 0.3;
          const opacity = Math.max(0.5 - (deltaY / maxDrag) * 0.5, 0);
          backdrop.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        }
      }
    };

    // Handle drag end
    const handleDragEnd = () => {
      if (!isDragging || !swipeToClose) return;

      setIsDragging(false);
      document.body.style.overflow = '';

      const deltaY = dragCurrentY - dragStartY;
      const threshold = window.innerHeight * 0.2;

      const sheet = sheetRef.current;
      const backdrop = backdropRef.current;

      if (sheet) {
        if (deltaY > threshold) {
          // Close the sheet
          setIsAnimating(true);
          sheet.style.transform = `translateY(100%)`;
          if (backdrop) {
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0)';
          }
          setTimeout(() => {
            onClose();
            setIsAnimating(false);
          }, 250);
        } else {
          // Snap back to position
          sheet.style.transform = 'translateY(0)';
          if (backdrop) {
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }
        }
      }
    };

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
      handleDragStart(e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleDragMove(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    // Add global event listeners for drag
    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, {
          passive: false,
        });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };
      }
    }, [isDragging, dragStartY]);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [isOpen, onClose]);

    // Focus management
    useEffect(() => {
      if (isOpen && sheetRef.current) {
        const focusableElements = sheetRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0] as HTMLElement;
        if (firstElement) {
          firstElement.focus();
        }
      }
    }, [isOpen]);

    // Prevent body scroll when open
    useEffect(() => {
      if (isOpen) {
        document.body.classList.add('mobile-scroll-lock');
        return () => {
          document.body.classList.remove('mobile-scroll-lock');
        };
      }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-end justify-center',
          'sm:items-center sm:justify-center',
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sheet-title' : undefined}
        aria-describedby={description ? 'sheet-description' : undefined}
      >
        {/* Backdrop */}
        <div
          ref={backdropRef}
          className={cn(
            'absolute inset-0 bg-black/50 backdrop-blur-sm',
            'transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />

        {/* Sheet Content */}
        <div
          ref={combinedRef}
          className={cn(
            'relative w-full max-w-lg mx-auto',
            'bg-background rounded-t-2xl shadow-2xl',
            'transform transition-transform duration-300 ease-out',
            'max-h-[90vh] flex flex-col',
            // Safe area handling
            'safe-area-bottom',
            // Animation classes
            isOpen && !isAnimating ? 'translate-y-0' : 'translate-y-full',
            // Desktop styles
            'sm:rounded-2xl sm:max-h-[80vh] sm:mb-8',
            contentClassName,
          )}
          style={{
            height: getSheetHeight(currentSnapPoint),
          }}
        >
          {/* Drag Handle */}
          {showDragHandle && (
            <div
              className={cn(
                'flex justify-center py-3 cursor-grab active:cursor-grabbing',
                'touch-manipulation',
              )}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              role="button"
              aria-label="Drag to resize or close"
            >
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
          )}

          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between p-4 pb-2">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2
                    id="sheet-title"
                    className="text-lg font-semibold text-foreground truncate"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="sheet-description"
                    className="text-sm text-muted-foreground mt-1"
                  >
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-center',
                    'w-8 h-8 rounded-full',
                    'text-muted-foreground hover:text-foreground',
                    'hover:bg-muted transition-colors',
                    'touch-target-min',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                  aria-label="Close sheet"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div
            ref={contentRef}
            className={cn(
              'flex-1 overflow-y-auto mobile-scroll',
              'px-4 pb-4',
              // Prevent scroll close if specified
              preventScrollClose && 'overscroll-behavior-none',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);

MobileBottomSheet.displayName = 'MobileBottomSheet';

export default MobileBottomSheet;

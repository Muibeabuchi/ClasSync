import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronLeft } from 'lucide-react';

export interface MobileFullScreenModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  showCloseButton?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  headerActions?: React.ReactNode;
  transition?: 'slide-up' | 'slide-right' | 'fade' | 'zoom';
  swipeToClose?: boolean;
  backdropDismiss?: boolean;
  preventBodyScroll?: boolean;
  stackLevel?: number;
}

export const MobileFullScreenModal = forwardRef<
  HTMLDivElement,
  MobileFullScreenModalProps
>(
  (
    {
      children,
      isOpen,
      onClose,
      title,
      subtitle,
      className,
      contentClassName,
      headerClassName,
      showCloseButton = true,
      showBackButton = false,
      onBack,
      headerActions,
      transition = 'slide-up',
      swipeToClose = true,
      backdropDismiss = false,
      preventBodyScroll = true,
      stackLevel = 0,
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(0);
    const [dragCurrentY, setDragCurrentY] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    // Combine refs
    const combinedRef = (node: HTMLDivElement) => {
      modalRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (backdropDismiss && e.target === backdropRef.current) {
        onClose();
      }
    };

    // Handle back button
    const handleBack = () => {
      if (onBack) {
        onBack();
      } else {
        onClose();
      }
    };

    // Handle drag start
    const handleDragStart = (clientY: number) => {
      if (!swipeToClose || transition !== 'slide-up') return;

      const content = contentRef.current;
      if (!content) return;

      // Only allow drag if content is scrolled to top
      if (content.scrollTop > 0) return;

      setIsDragging(true);
      setDragStartY(clientY);
      setDragCurrentY(clientY);

      // Prevent body scroll during drag
      if (preventBodyScroll) {
        document.body.style.overflow = 'hidden';
      }
    };

    // Handle drag move
    const handleDragMove = (clientY: number) => {
      if (!isDragging || !swipeToClose) return;

      setDragCurrentY(clientY);

      const deltaY = clientY - dragStartY;
      const modal = modalRef.current;

      if (modal && deltaY > 0) {
        // Only allow dragging down
        modal.style.transform = `translateY(${deltaY}px)`;

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
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }

      const deltaY = dragCurrentY - dragStartY;
      const threshold = window.innerHeight * 0.2;

      const modal = modalRef.current;
      const backdrop = backdropRef.current;

      if (modal) {
        if (deltaY > threshold) {
          // Close the modal
          setIsAnimating(true);
          modal.style.transform = `translateY(100%)`;
          if (backdrop) {
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0)';
          }
          setTimeout(() => {
            onClose();
            setIsAnimating(false);
          }, 300);
        } else {
          // Snap back to position
          modal.style.transform = 'translateY(0)';
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
      if (isDragging) {
        e.preventDefault();
      }
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
      if (isOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
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
      if (isOpen && preventBodyScroll) {
        document.body.classList.add('mobile-scroll-lock');
        return () => {
          document.body.classList.remove('mobile-scroll-lock');
        };
      }
    }, [isOpen, preventBodyScroll]);

    // Get transition classes
    const getTransitionClasses = () => {
      const baseClasses = 'transition-all duration-300 ease-out';

      if (!isOpen || isAnimating) {
        switch (transition) {
          case 'slide-up':
            return `${baseClasses} translate-y-full`;
          case 'slide-right':
            return `${baseClasses} translate-x-full`;
          case 'fade':
            return `${baseClasses} opacity-0`;
          case 'zoom':
            return `${baseClasses} scale-95 opacity-0`;
          default:
            return `${baseClasses} translate-y-full`;
        }
      }

      return `${baseClasses} translate-y-0 translate-x-0 opacity-100 scale-100`;
    };

    if (!isOpen) return null;

    return (
      <div
        className={cn(
          'fixed inset-0 flex flex-col',
          // Z-index stacking for multiple modals
          `z-[${50 + stackLevel}]`,
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={subtitle ? 'modal-subtitle' : undefined}
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

        {/* Modal Content */}
        <div
          ref={combinedRef}
          className={cn(
            'relative flex flex-col',
            'w-full h-full',
            'bg-background',
            'safe-area-inset',
            getTransitionClasses(),
            contentClassName,
          )}
          onMouseDown={swipeToClose ? handleMouseDown : undefined}
          onTouchStart={swipeToClose ? handleTouchStart : undefined}
        >
          {/* Header */}
          <header
            className={cn(
              'flex items-center justify-between',
              'px-4 py-3 border-b border-border',
              'bg-background/95 backdrop-blur-sm',
              'shrink-0',
              headerClassName,
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Back Button */}
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className={cn(
                    'flex items-center justify-center',
                    'w-10 h-10 rounded-full',
                    'text-muted-foreground hover:text-foreground',
                    'hover:bg-muted transition-colors',
                    'touch-target-min',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Title and Subtitle */}
              <div className="flex-1 min-w-0">
                {title && (
                  <h1
                    id="modal-title"
                    className="text-lg font-semibold text-foreground truncate"
                  >
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p
                    id="modal-subtitle"
                    className="text-sm text-muted-foreground truncate"
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {headerActions}

              {/* Close Button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-center',
                    'w-10 h-10 rounded-full',
                    'text-muted-foreground hover:text-foreground',
                    'hover:bg-muted transition-colors',
                    'touch-target-min',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </header>

          {/* Content */}
          <main
            ref={contentRef}
            className={cn(
              'flex-1 overflow-y-auto mobile-scroll',
              'overscroll-behavior-contain',
            )}
          >
            {children}
          </main>
        </div>
      </div>
    );
  },
);

MobileFullScreenModal.displayName = 'MobileFullScreenModal';

export default MobileFullScreenModal;

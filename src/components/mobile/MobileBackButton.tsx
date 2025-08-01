import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

interface MobileBackButtonProps {
  to: string;
  title?: string;
  className?: string;
}

export const MobileBackButton: React.FC<MobileBackButtonProps> = ({
  to,
  title = 'Back',
  className,
}) => {
  return (
    <div
      className={cn(
        'sticky top-0 z-40',
        'bg-background/95 backdrop-blur-sm',
        'border-b border-border',
        'px-4 py-3',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Link
          to={to}
          className={cn(
            'flex items-center justify-center',
            'w-10 h-10 rounded-full',
            'bg-accent/50 hover:bg-accent',
            'transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'active:scale-95',
          )}
          aria-label={`Go back to ${title}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </div>
  );
};

export default MobileBackButton;

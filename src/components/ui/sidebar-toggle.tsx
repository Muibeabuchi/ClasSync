import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function SidebarToggle({
  className,
  onClick,
  ...props
}: SidebarToggleProps) {
  const { toggleSidebar, state } = useSidebar();

  const isExpanded = state === 'expanded';

  return (
    <Button
      data-sidebar="toggle"
      data-slot="sidebar-toggle"
      variant="ghost"
      size="icon"
      className={cn(
        ' hover:bg-accent hover:text-accent-foreground transition-colors duration-200',
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      {isExpanded ? (
        <ChevronsLeft className="size-5" />
      ) : (
        <ChevronsRight className="size-5" />
      )}
      <span className="sr-only">
        {isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
      </span>
    </Button>
  );
}

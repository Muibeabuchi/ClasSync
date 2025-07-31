import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';

interface JoinRequestsSkeletonProps {
  showEmptyState?: boolean;
  requestCount?: number;
}

const JoinRequestsSkeleton = ({
  showEmptyState = false,
  requestCount = 5,
}: JoinRequestsSkeletonProps) => {
  if (showEmptyState) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in px-4 sm:px-0">
        {/* Header Skeleton - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="hover:scale-110 transition-transform shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
              <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
              <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
            </div>
          </div>
          <Badge
            variant="secondary"
            className="px-3 py-1 self-start sm:self-auto"
          >
            <Skeleton className="h-4 w-12 sm:w-16" />
          </Badge>
        </div>

        {/* Empty State Skeleton - Mobile Responsive */}
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
          <div className="rounded-full bg-muted/50 p-4 sm:p-6 mb-3 sm:mb-4">
            <UserPlus className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground animate-pulse" />
          </div>
          <Skeleton className="h-5 sm:h-6 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-64 sm:w-80 mb-4 sm:mb-6" />
          <div className="space-y-2 w-full max-w-sm">
            <Skeleton className="h-4 sm:h-5 w-48 sm:w-56 mx-auto" />
            <div className="space-y-1">
              <Skeleton className="h-3 sm:h-4 w-56 sm:w-72 mx-auto" />
              <Skeleton className="h-3 sm:h-4 w-48 sm:w-64 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in px-4 sm:px-0">
      {/* Header Skeleton - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="hover:scale-110 transition-transform shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
            <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
            <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
          </div>
        </div>
        <Badge
          variant="secondary"
          className="px-3 py-1 self-start sm:self-auto"
        >
          <Skeleton className="h-4 w-12 sm:w-16" />
        </Badge>
      </div>

      {/* Request Cards Skeleton - Mobile Responsive */}
      <div className="grid gap-3 sm:gap-4">
        {Array.from({ length: requestCount }).map((_, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm bg-gradient-to-r from-background to-muted/30 animate-pulse"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center space-x-3">
                  {/* Avatar Skeleton */}
                  <div className="h-10 w-10 rounded-full ring-2 ring-muted shrink-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>

                  {/* Student Info Skeleton */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Skeleton className="h-4 w-28 sm:w-32" />
                      <div className="border rounded px-2 py-0.5 self-start">
                        <Skeleton className="h-3 w-16 sm:w-20" />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                      <Skeleton className="h-3 w-24 sm:w-28" />
                      <span className="hidden sm:inline text-muted-foreground">
                        •
                      </span>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-14 sm:w-16" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badge Skeleton */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge variant="secondary" className="px-2 py-1">
                    <Skeleton className="h-3 w-12 sm:w-14" />
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Individual Request Card Skeleton (for reuse) - Mobile Responsive
export const JoinRequestCardSkeleton = () => (
  <Card className="border-0 shadow-sm bg-gradient-to-r from-background to-muted/30 animate-pulse">
    <CardContent className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full ring-2 ring-muted shrink-0" />
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Skeleton className="h-4 w-28 sm:w-32" />
              <div className="border rounded px-2 py-0.5 self-start">
                <Skeleton className="h-3 w-16 sm:w-20" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <Skeleton className="h-3 w-24 sm:w-28" />
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-14 sm:w-16" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="secondary" className="px-2 py-1">
            <Skeleton className="h-3 w-12 sm:w-14" />
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Header Skeleton (for reuse) - Mobile Responsive
export const JoinRequestsHeaderSkeleton = () => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-0">
    <div className="flex items-center space-x-3 sm:space-x-4">
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="hover:scale-110 transition-transform shrink-0"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
        <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
        <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
      </div>
    </div>
    <Badge variant="secondary" className="px-3 py-1 self-start sm:self-auto">
      <Skeleton className="h-4 w-12 sm:w-16" />
    </Badge>
  </div>
);

export default JoinRequestsSkeleton;

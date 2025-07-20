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
      <div className="space-y-6 animate-fade-in">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="hover:scale-110 transition-transform"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Skeleton className="h-4 w-16" />
          </Badge>
        </div>

        {/* Empty State Skeleton */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted/50 p-6 mb-4">
            <UserPlus className="h-12 w-12 text-muted-foreground animate-pulse" />
          </div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-80 mb-6" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-56" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="hover:scale-110 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Skeleton className="h-4 w-16" />
        </Badge>
      </div>

      {/* Request Cards Skeleton */}
      <div className="grid gap-4">
        {Array.from({ length: requestCount }).map((_, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm bg-gradient-to-r from-background to-muted/30 animate-pulse"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar Skeleton */}
                  <div className="h-10 w-10 rounded-full ring-2 ring-muted">
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>

                  {/* Student Info Skeleton */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="border rounded px-2 py-0.5">
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Skeleton className="h-3 w-28" />
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badge Skeleton */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-2 py-1">
                    <Skeleton className="h-3 w-14" />
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

// Individual Request Card Skeleton (for reuse)
export const JoinRequestCardSkeleton = () => (
  <Card className="border-0 shadow-sm bg-gradient-to-r from-background to-muted/30 animate-pulse">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full ring-2 ring-muted" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <div className="border rounded px-2 py-0.5">
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-28" />
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="px-2 py-1">
          <Skeleton className="h-3 w-14" />
        </Badge>
      </div>
    </CardContent>
  </Card>
);

// Header Skeleton (for reuse)
export const JoinRequestsHeaderSkeleton = () => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="hover:scale-110 transition-transform"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <Badge variant="secondary" className="px-3 py-1">
      <Skeleton className="h-4 w-16" />
    </Badge>
  </div>
);

export default JoinRequestsSkeleton;

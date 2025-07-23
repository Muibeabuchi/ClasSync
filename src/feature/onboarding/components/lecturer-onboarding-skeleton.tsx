import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LecturerOnboardingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Progress Indicator Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-16 h-1" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
          <div className="text-center">
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-96 mt-2" />
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Profile Image Upload Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" /> {/* Label */}
              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 rounded-full bg-muted">
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <div className="space-y-2 text-center">
                    <Skeleton className="h-4 w-48 mx-auto" />
                    <Skeleton className="h-3 w-36 mx-auto" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-56 mx-auto" />
                    <Skeleton className="h-3 w-32 mx-auto" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-3 w-80" /> {/* Description */}
            </div>

            {/* Academic Title Selection Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" /> {/* Label */}
              <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
              <Skeleton className="h-3 w-72" /> {/* Description */}
            </div>

            {/* Full Name Input Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* Label */}
              <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
              <Skeleton className="h-3 w-64" /> {/* Description */}
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex justify-between pt-6">
              <Skeleton className="h-10 w-20 rounded-md" />{' '}
              {/* Cancel Button */}
              <Skeleton className="h-10 w-32 rounded-md" />{' '}
              {/* Submit Button */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LecturerOnboardingSkeleton;

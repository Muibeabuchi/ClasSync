import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  MobileBottomNavigationDemo,
  MobilePageContainerDemo,
  MobileModalDemo,
} from '@/components/mobile';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/mobile-demo')({
  component: MobileDemo,
});

function MobileDemo() {
  const [activeDemo, setActiveDemo] = useState<
    'navigation' | 'container' | 'modals' | 'overview'
  >('overview');

  if (activeDemo === 'navigation') {
    return <MobileBottomNavigationDemo />;
  }

  if (activeDemo === 'container') {
    return <MobilePageContainerDemo />;
  }

  if (activeDemo === 'modals') {
    return <MobileModalDemo />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Mobile Components Demo</h1>
          <p className="text-muted-foreground">
            Interactive demos of mobile-first UI components
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mobile Bottom Navigation</CardTitle>
            <CardDescription>
              Fixed bottom navigation with touch-friendly tabs, badges, and
              smooth transitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <p>
                  ✅ 5 navigation tabs (Home, Courses, Check In, Inbox, Profile)
                </p>
                <p>✅ Touch-friendly 48x48px minimum touch targets</p>
                <p>✅ Active state highlighting and smooth transitions</p>
                <p>✅ Badge support for notification counts</p>
                <p>✅ Proper ARIA labels and accessibility</p>
              </div>
              <Button
                onClick={() => setActiveDemo('navigation')}
                className="w-full"
              >
                View Navigation Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobile Page Container</CardTitle>
            <CardDescription>
              Full-screen page container with transitions, safe area handling,
              and optimized scrolling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <p>✅ Full-screen layout with 100dvh viewport handling</p>
                <p>✅ Smooth page transitions (slide, fade)</p>
                <p>✅ Optimized momentum scrolling for mobile</p>
                <p>✅ Safe area support for notched devices</p>
                <p>✅ Optional header with actions</p>
                <p>✅ Proper bottom navigation spacing</p>
              </div>
              <Button
                onClick={() => setActiveDemo('container')}
                className="w-full"
              >
                View Container Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobile Modal & Sheet System</CardTitle>
            <CardDescription>
              Bottom sheets and full-screen modals with swipe gestures and
              proper focus management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <p>✅ MobileBottomSheet for forms and quick actions</p>
                <p>✅ MobileFullScreenModal for detailed views</p>
                <p>✅ Swipe-to-dismiss gestures and backdrop interactions</p>
                <p>✅ Proper modal stacking and focus management</p>
                <p>✅ Multiple transition types (slide, fade, zoom)</p>
                <p>✅ Touch-friendly drag handles and controls</p>
              </div>
              <Button
                onClick={() => setActiveDemo('modals')}
                className="w-full"
              >
                View Modal System Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Implementation Status</CardTitle>
            <CardDescription>Mobile UI transformation progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Mobile-first foundation and viewport configuration</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Mobile bottom navigation component</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Mobile page container with transitions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Transform student dashboard to mobile-first layout</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Mobile modal and sheet system</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">⏳</span>
                <span>Optimize courses page for mobile interaction</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

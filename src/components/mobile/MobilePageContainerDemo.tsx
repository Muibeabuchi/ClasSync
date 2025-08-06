import React, { useState } from 'react';
import { MobilePageContainer } from './MobilePageContainer';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Bell, Search } from 'lucide-react';

export const MobilePageContainerDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'courses' | 'checkin' | 'inbox' | 'profile'
  >('home');
  const [transition, setTransition] = useState<
    'slide-left' | 'slide-right' | 'fade' | 'none'
  >('fade');
  const [showHeader, setShowHeader] = useState(true);

  const handleTabChange = (
    newTab: 'home' | 'courses' | 'checkin' | 'inbox' | 'profile',
  ) => {
    // Determine transition direction based on tab order
    const tabOrder = ['home', 'courses', 'checkin', 'inbox', 'profile'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);

    if (newIndex > currentIndex) {
      setTransition('slide-left');
    } else if (newIndex < currentIndex) {
      setTransition('slide-right');
    } else {
      setTransition('fade');
    }

    setActiveTab(newTab);
  };

  const getPageContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Welcome Home</h2>
              <p className="text-muted-foreground">
                This is the home page content with smooth transitions and proper
                mobile layout.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Page Container Features</CardTitle>
                <CardDescription>
                  Demonstrating mobile-first design patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">✅ Full-screen layout</h4>
                  <p className="text-sm text-muted-foreground">
                    Uses 100dvh for proper mobile viewport handling
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">✅ Safe area support</h4>
                  <p className="text-sm text-muted-foreground">
                    Handles notched devices and home indicators
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">✅ Smooth scrolling</h4>
                  <p className="text-sm text-muted-foreground">
                    Optimized momentum scrolling for mobile
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">✅ Page transitions</h4>
                  <p className="text-sm text-muted-foreground">
                    Slide and fade animations between pages
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Add some content to test scrolling */}
            {Array.from({ length: 10 }, (_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Content Card {i + 1}</h3>
                  <p className="text-sm text-muted-foreground">
                    This is sample content to demonstrate smooth scrolling
                    behavior on mobile devices. The container handles momentum
                    scrolling and proper overscroll behavior.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'courses':
        return (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <p className="text-muted-foreground">
                Course list with mobile-optimized layout
              </p>
            </div>

            {Array.from({ length: 5 }, (_, i) => (
              <Card key={i} className="mobile-touch-feedback">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Course {i + 1}</h3>
                      <p className="text-sm text-muted-foreground">
                        CS{100 + i} • Prof. Smith
                      </p>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'checkin':
        return (
          <div className="p-4 space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Check In</h2>
              <p className="text-muted-foreground">
                GPS-based attendance check-in
              </p>
            </div>

            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-green-700">
                    Location Found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You're within range of the classroom
                  </p>
                </div>
                <Button className="w-full touch-target-comfortable">
                  Check In Now
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'inbox':
        return (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Notifications</h2>
              <p className="text-muted-foreground">
                Your recent notifications and messages
              </p>
            </div>

            {Array.from({ length: 8 }, (_, i) => (
              <Card key={i} className="mobile-touch-feedback">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold text-sm">
                        Notification {i + 1}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        This is a sample notification message that demonstrates
                        the mobile-optimized layout.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i + 1} hour{i !== 0 ? 's' : ''} ago
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'profile':
        return (
          <div className="p-4 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">JS</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">John Student</h2>
                <p className="text-muted-foreground">
                  john.student@university.edu
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Settings</h3>
                <div className="space-y-2">
                  {[
                    'Account Settings',
                    'Notification Preferences',
                    'Privacy Settings',
                    'Help & Support',
                    'About',
                  ].map((item, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      className="w-full justify-start touch-target-comfortable"
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const getHeaderActions = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        );
      case 'courses':
        return (
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        );
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Dashboard';
      case 'courses':
        return 'My Courses';
      case 'checkin':
        return 'Attendance';
      case 'inbox':
        return 'Notifications';
      case 'profile':
        return 'Profile';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Controls */}
      <div className="fixed top-4 left-4 z-50 bg-card border rounded-lg p-2 shadow-lg">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span>Transition:</span>
            <select
              value={transition}
              onChange={(e) => setTransition(e.target.value as any)}
              className="text-xs border rounded px-1"
            >
              <option value="fade">Fade</option>
              <option value="slide-left">Slide Left</option>
              <option value="slide-right">Slide Right</option>
              <option value="none">None</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showHeader}
              onChange={(e) => setShowHeader(e.target.checked)}
            />
            Show Header
          </label>
        </div>
      </div>

      {/* Mobile Page Container */}
      <MobilePageContainer
        key={activeTab} // Force re-render for transition
        showHeader={showHeader}
        headerTitle={getHeaderTitle()}
        headerActions={getHeaderActions()}
        transition={transition}
        onTransitionEnd={() => {
          console.log(`Transition to ${activeTab} completed`);
        }}
      >
        {getPageContent()}
      </MobilePageContainer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        notificationCount={3}
      />
    </div>
  );
};

export default MobilePageContainerDemo;

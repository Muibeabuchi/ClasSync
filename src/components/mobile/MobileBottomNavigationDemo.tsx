import React, { useState } from 'react';
import { MobileBottomNavigation } from './MobileBottomNavigation';

export const MobileBottomNavigationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'courses' | 'checkin' | 'inbox' | 'profile'
  >('home');
  const [notificationCount, setNotificationCount] = useState(3);

  const handleTabChange = (
    tab: 'home' | 'courses' | 'checkin' | 'inbox' | 'profile',
  ) => {
    setActiveTab(tab);
    // Simulate clearing notifications when inbox is visited
    if (tab === 'inbox') {
      setTimeout(() => setNotificationCount(0), 1000);
    }
  };

  const addNotification = () => {
    setNotificationCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Demo content */}
      <div className="flex-1 p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-center">
            Mobile Bottom Navigation Demo
          </h1>

          <div className="bg-card border rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold">Current Tab: {activeTab}</h2>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Notification count: {notificationCount}
              </p>
              <button
                onClick={addNotification}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Add Notification
              </button>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Features Demonstrated:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                ✅ 5 navigation tabs (Home, Courses, Check In, Inbox, Profile)
              </li>
              <li>✅ Touch-friendly 48x48px minimum touch targets</li>
              <li>✅ Active state highlighting with primary color</li>
              <li>✅ Smooth transitions between tabs</li>
              <li>✅ Badge support for notification counts</li>
              <li>✅ Proper ARIA labels and accessibility</li>
              <li>✅ Safe area support for mobile devices</li>
              <li>✅ Touch feedback with scale animation</li>
            </ul>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Try it out:</h3>
            <p className="text-sm text-muted-foreground">
              Tap the navigation items at the bottom to see the active state
              change. The inbox tab shows a notification badge that will clear
              when you visit it.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        notificationCount={notificationCount}
      />
    </div>
  );
};

export default MobileBottomNavigationDemo;

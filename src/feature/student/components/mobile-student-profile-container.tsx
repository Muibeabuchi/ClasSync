import { useState } from 'react';
import MobileStudentProfile from './mobile-student-profile';
import MobileStudentSettings from './mobile-student-settings';

const MobileStudentProfileContainer = () => {
  const [currentView, setCurrentView] = useState<'profile' | 'settings'>(
    'profile',
  );

  if (currentView === 'settings') {
    return <MobileStudentSettings onBack={() => setCurrentView('profile')} />;
  }

  return (
    <MobileStudentProfile onOpenSettings={() => setCurrentView('settings')} />
  );
};

export default MobileStudentProfileContainer;

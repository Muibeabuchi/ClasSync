// import { useState } from 'react';
import MobileStudentProfile from './mobile-student-profile';
// import MobileStudentSettings from './mobile-student-settings';
import { useNavigate } from '@tanstack/react-router';

const MobileStudentProfileContainer = () => {
  const navigate = useNavigate();

  return (
    <MobileStudentProfile
      onOpenSettings={() => navigate({ to: '/dashboard/student/settings' })}
    />
  );
};

export default MobileStudentProfileContainer;

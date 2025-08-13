import { useEffect, useState } from 'react';
import LecturerProfile from './lecturer-profile';
import MobileLecturerProfile from './mobile-lecturer-profile';

const LecturerProfilePage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (isMobile) {
    return <MobileLecturerProfile />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <LecturerProfile />
    </div>
  );
};

export default LecturerProfilePage;

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Plus } from 'lucide-react';
import JoinCourseModal from './join-course-modal';

interface JoinCourseSheetProps {
  children?: React.ReactNode;
}

const JoinCourseSheet = ({ children }: JoinCourseSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const trigger = children || (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      <span className="hidden sm:inline">Join Course</span>
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="h-[400px]">
          <DrawerHeader>
            <DrawerTitle>Join New Course</DrawerTitle>
            <DrawerDescription>
              Search for a course using the code provided by your lecturer
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <JoinCourseModal onSuccess={handleSuccess} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full md:px-2 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Join New Course</SheetTitle>
          <SheetDescription>
            Search for a course using the code provided by your lecturer
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <JoinCourseModal onSuccess={handleSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default JoinCourseSheet;

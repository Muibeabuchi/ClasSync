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
import { JoinCourseStepForm } from './join-course-step-form';

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
        <DrawerContent className="h-[100dvh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <DrawerTitle>Join New Course</DrawerTitle>
            <DrawerDescription>
              Follow the steps to join your course
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 pb-8">
              <JoinCourseStepForm onSuccess={handleSuccess} isMobile={true} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Join New Course</SheetTitle>
          <SheetDescription>
            Follow the steps to join your course
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto mt-6">
          <JoinCourseStepForm onSuccess={handleSuccess} isMobile={false} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default JoinCourseSheet;

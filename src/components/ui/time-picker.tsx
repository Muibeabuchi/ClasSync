import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    { value, onChange, placeholder = 'Select time', disabled, className },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Generate time options (24-hour format)
    const generateTimeOptions = () => {
      const options = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          options.push(timeString);
        }
      }
      return options;
    };

    const timeOptions = generateTimeOptions();

    const handleTimeSelect = (time: string) => {
      onChange(time);
      setIsOpen(false);
    };

    const formatDisplayTime = (time: string) => {
      if (!time) return placeholder;

      // Convert 24-hour to 12-hour format for display
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';

      return `${hour12}:${minutes} ${ampm}`;
    };

    const TimeOptionsContent = () => (
      <div className="grid grid-cols-2 gap-1 p-2 max-h-80 overflow-y-auto">
        {timeOptions.map((time) => (
          <Button
            key={time}
            variant="ghost"
            size="sm"
            className={cn(
              'justify-center font-normal text-sm h-10',
              value === time && 'bg-primary text-primary-foreground',
            )}
            onClick={() => handleTimeSelect(time)}
          >
            {formatDisplayTime(time)}
          </Button>
        ))}
      </div>
    );

    const TriggerButton = React.forwardRef<HTMLButtonElement>(
      (props, triggerRef) => (
        <Button
          ref={triggerRef}
          variant="outline"
          className={cn(
            'w-full justify-between text-left font-normal h-10 px-3',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
          {...props}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="truncate">{formatDisplayTime(value || '')}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      ),
    );

    if (isMobile) {
      return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <TriggerButton ref={ref} />
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader className="text-center">
              <DrawerTitle>Select Time</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <TimeOptionsContent />
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <TriggerButton ref={ref} />
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <TimeOptionsContent />
        </PopoverContent>
      </Popover>
    );
  },
);

TimePicker.displayName = 'TimePicker';

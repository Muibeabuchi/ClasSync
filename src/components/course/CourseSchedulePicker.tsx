import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimePicker } from '@/components/ui/time-picker';
import { AlertCircle, Calendar, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LectureSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

interface CourseSchedulePickerProps {
  value?: LectureSchedule[];
  onChange: (schedules: LectureSchedule[]) => void;
  className?: string;
  disabled?: boolean;
}

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const CourseSchedulePicker: React.FC<CourseSchedulePickerProps> = ({
  value = [],
  onChange,
  className,
  disabled = false,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate time range
  const validateTimeRange = useCallback(
    (startTime: string, endTime: string): string | null => {
      if (!startTime || !endTime) {
        return 'Both start and end times are required';
      }

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      if (endMinutes <= startMinutes) {
        return 'End time must be after start time';
      }

      if (endMinutes - startMinutes < 30) {
        return 'Lecture must be at least 30 minutes long';
      }

      return null;
    },
    [],
  );

  // Check if a day is selected
  const isDaySelected = useCallback(
    (day: string): boolean => {
      return value.some((schedule) => schedule.day === day);
    },
    [value],
  );

  // Get schedule for a specific day
  const getScheduleForDay = useCallback(
    (day: string): LectureSchedule | undefined => {
      return value.find((schedule) => schedule.day === day);
    },
    [value],
  );

  // Toggle day selection
  const toggleDay = useCallback(
    (day: string) => {
      if (disabled) return;

      const isSelected = isDaySelected(day);

      if (isSelected) {
        // Remove the day
        const newSchedules = value.filter((schedule) => schedule.day !== day);
        onChange(newSchedules);

        // Clear any errors for this day
        const newErrors = { ...errors };
        delete newErrors[day];
        setErrors(newErrors);
      } else {
        // Add the day with default times
        const newSchedule: LectureSchedule = {
          day,
          startTime: '09:00',
          endTime: '10:30',
        };
        onChange([...value, newSchedule]);
      }
    },
    [disabled, isDaySelected, value, onChange, errors],
  );

  // Update time for a specific day
  const updateTime = useCallback(
    (day: string, field: 'startTime' | 'endTime', time: string) => {
      if (disabled) return;

      const newSchedules = value.map((schedule) => {
        if (schedule.day === day) {
          const updatedSchedule = { ...schedule, [field]: time };

          // Validate the time range
          const error = validateTimeRange(
            updatedSchedule.startTime,
            updatedSchedule.endTime,
          );
          const newErrors = { ...errors };

          if (error) {
            newErrors[day] = error;
          } else {
            delete newErrors[day];
          }

          setErrors(newErrors);
          return updatedSchedule;
        }
        return schedule;
      });

      onChange(newSchedules);
    },
    [disabled, value, onChange, validateTimeRange, errors],
  );

  // Format time for display
  const formatTimeRange = useCallback(
    (startTime: string, endTime: string): string => {
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
      };

      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    },
    [],
  );

  // Check if form is valid
  const hasErrors = Object.keys(errors).length > 0;
  const hasNoSchedules = value.length === 0;

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lecture Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Day Selection */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Select Lecture Days</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {WEEKDAYS.map((day) => {
                const isSelected = isDaySelected(day);
                const hasError = errors[day];

                return (
                  <Button
                    key={day}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDay(day)}
                    disabled={disabled}
                    className={cn(
                      'transition-all duration-200 text-xs px-2 min-w-0',
                      hasError && 'border-destructive',
                      isSelected && 'shadow-sm',
                    )}
                  >
                    <span className="hidden lg:inline truncate">{day}</span>
                    <span className="lg:hidden truncate">
                      {day.slice(0, 3)}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Time Configuration for Selected Days - Compact Design */}
          {value.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Configure Lecture Times</h4>
              <div className="space-y-2">
                {value.map((schedule) => (
                  <div
                    key={schedule.day}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    {/* Day Badge */}
                    <Badge
                      variant="secondary"
                      className="shrink-0 min-w-16 justify-center"
                    >
                      {schedule.day.slice(0, 3)}
                    </Badge>

                    {/* Time Pickers - Horizontal Layout */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <TimePicker
                        value={schedule.startTime}
                        onChange={(time) =>
                          updateTime(schedule.day, 'startTime', time)
                        }
                        placeholder="Start"
                        disabled={disabled}
                        className="flex-1 min-w-0"
                      />
                      <span className="text-muted-foreground text-sm shrink-0">
                        to
                      </span>
                      <TimePicker
                        value={schedule.endTime}
                        onChange={(time) =>
                          updateTime(schedule.day, 'endTime', time)
                        }
                        placeholder="End"
                        disabled={disabled}
                        className="flex-1 min-w-0"
                      />
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDay(schedule.day)}
                      disabled={disabled}
                      className="h-8 w-8 p-0 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      title={`Remove ${schedule.day}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {/* Error Indicator */}
                    {errors[schedule.day] && (
                      <div className="shrink-0">
                        <AlertCircle
                          className="h-4 w-4 text-destructive"
                          title={errors[schedule.day]}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Error Messages */}
              {Object.entries(errors).map(([day, error]) => (
                <div
                  key={day}
                  className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 p-2 rounded-md"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>{day}:</strong> {error}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Schedule Summary */}
          {value.length > 0 && !hasErrors && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Summary
              </h4>
              <div className="space-y-2">
                {value.map((schedule) => (
                  <div
                    key={schedule.day}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-medium">{schedule.day}</span>
                    <span className="text-muted-foreground">
                      {formatTimeRange(schedule.startTime, schedule.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Messages */}
          {hasNoSchedules && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Please select at least one lecture day</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseSchedulePicker;

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import CourseSchedulePicker, {
  type LectureSchedule,
} from './CourseSchedulePicker';

const meta: Meta<typeof CourseSchedulePicker> = {
  title: 'Components/Course/CourseSchedulePicker',
  component: CourseSchedulePicker,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CourseSchedulePicker>;

// Wrapper component for controlled state
const SchedulePickerWrapper = ({
  initialValue = [],
  disabled = false,
}: {
  initialValue?: LectureSchedule[];
  disabled?: boolean;
}) => {
  const [schedules, setSchedules] = useState<LectureSchedule[]>(initialValue);

  return (
    <div className="max-w-4xl">
      <CourseSchedulePicker
        value={schedules}
        onChange={setSchedules}
        disabled={disabled}
      />

      {/* Debug output */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Current Value:</h4>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(schedules, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <SchedulePickerWrapper />,
};

export const WithInitialSchedule: Story = {
  render: () => (
    <SchedulePickerWrapper
      initialValue={[
        { day: 'Monday', startTime: '09:00', endTime: '11:00' },
        { day: 'Wednesday', startTime: '14:00', endTime: '16:00' },
        { day: 'Friday', startTime: '10:00', endTime: '12:00' },
      ]}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <SchedulePickerWrapper
      initialValue={[{ day: 'Tuesday', startTime: '13:00', endTime: '15:30' }]}
      disabled={true}
    />
  ),
};

export const MobileView: Story = {
  render: () => <SchedulePickerWrapper />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

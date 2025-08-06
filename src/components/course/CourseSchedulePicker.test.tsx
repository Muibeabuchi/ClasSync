import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CourseSchedulePicker, {
  type LectureSchedule,
} from './CourseSchedulePicker';

describe('CourseSchedulePicker', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default state', () => {
    render(<CourseSchedulePicker value={[]} onChange={mockOnChange} />);

    expect(screen.getByText('Lecture Schedule')).toBeInTheDocument();
    expect(screen.getByText('Select Lecture Days')).toBeInTheDocument();
    expect(
      screen.getByText('Please select at least one lecture day'),
    ).toBeInTheDocument();
  });

  it('displays all weekdays', () => {
    render(<CourseSchedulePicker value={[]} onChange={mockOnChange} />);

    const weekdays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    weekdays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('allows selecting a day', async () => {
    render(<CourseSchedulePicker value={[]} onChange={mockOnChange} />);

    const mondayButton = screen.getByText('Monday');
    fireEvent.click(mondayButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([
        { day: 'Monday', startTime: '09:00', endTime: '10:30' },
      ]);
    });
  });

  it('shows time configuration when day is selected', () => {
    const initialValue: LectureSchedule[] = [
      { day: 'Monday', startTime: '09:00', endTime: '11:00' },
    ];

    render(
      <CourseSchedulePicker value={initialValue} onChange={mockOnChange} />,
    );

    expect(screen.getByText('Configure Lecture Times')).toBeInTheDocument();
    expect(screen.getByText('Schedule Summary')).toBeInTheDocument();
  });

  it('allows removing a selected day', async () => {
    const initialValue: LectureSchedule[] = [
      { day: 'Monday', startTime: '09:00', endTime: '11:00' },
    ];

    render(
      <CourseSchedulePicker value={initialValue} onChange={mockOnChange} />,
    );

    const removeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  it('validates time ranges', () => {
    const initialValue: LectureSchedule[] = [
      { day: 'Monday', startTime: '11:00', endTime: '10:00' }, // Invalid: end before start
    ];

    render(
      <CourseSchedulePicker value={initialValue} onChange={mockOnChange} />,
    );

    expect(
      screen.getByText('End time must be after start time'),
    ).toBeInTheDocument();
  });

  it('validates minimum lecture duration', () => {
    const initialValue: LectureSchedule[] = [
      { day: 'Monday', startTime: '09:00', endTime: '09:15' }, // Invalid: less than 30 minutes
    ];

    render(
      <CourseSchedulePicker value={initialValue} onChange={mockOnChange} />,
    );

    expect(
      screen.getByText('Lecture must be at least 30 minutes long'),
    ).toBeInTheDocument();
  });

  it('displays schedule summary correctly', () => {
    const initialValue: LectureSchedule[] = [
      { day: 'Monday', startTime: '09:00', endTime: '11:00' },
      { day: 'Wednesday', startTime: '14:00', endTime: '16:00' },
    ];

    render(
      <CourseSchedulePicker value={initialValue} onChange={mockOnChange} />,
    );

    expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
    expect(screen.getByText('2:00 PM - 4:00 PM')).toBeInTheDocument();
  });

  it('respects disabled state', () => {
    render(
      <CourseSchedulePicker
        value={[]}
        onChange={mockOnChange}
        disabled={true}
      />,
    );

    const mondayButton = screen.getByText('Monday');
    expect(mondayButton).toBeDisabled();
  });

  it('handles multiple day selection', async () => {
    render(<CourseSchedulePicker value={[]} onChange={mockOnChange} />);

    const mondayButton = screen.getByText('Monday');
    const wednesdayButton = screen.getByText('Wednesday');

    fireEvent.click(mondayButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([
        { day: 'Monday', startTime: '09:00', endTime: '10:30' },
      ]);
    });

    // Reset mock to check second call
    mockOnChange.mockClear();

    fireEvent.click(wednesdayButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([
        { day: 'Monday', startTime: '09:00', endTime: '10:30' },
        { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
      ]);
    });
  });
});

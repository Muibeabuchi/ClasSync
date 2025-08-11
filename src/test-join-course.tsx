import React from 'react';
import { JoinCourseStepForm } from './feature/student/components/join-course-step-form';

// Simple test component to verify the join course step form works
export const TestJoinCourse = () => {
  const handleSuccess = () => {
    console.log('Join course request submitted successfully!');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Test Join Course Form</h1>
      <JoinCourseStepForm onSuccess={handleSuccess} isMobile={false} />
    </div>
  );
};

export default TestJoinCourse;

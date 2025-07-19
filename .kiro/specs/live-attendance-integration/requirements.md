# Requirements Document

## Introduction

This feature involves integrating the LiveAttendancePage component with real backend data from Convex, replacing the current mock data implementation. The system should provide real-time attendance tracking for lecturers during active attendance sessions, showing student check-ins as they happen with proper GPS validation and attendance code verification.

## Requirements

### Requirement 1

**User Story:** As a lecturer, I want to view real-time attendance data during an active session, so that I can monitor student participation and manage attendance effectively.

#### Acceptance Criteria

1. WHEN a lecturer navigates to an active attendance session THEN the system SHALL display the actual session data from the backend
2. WHEN students check in to the session THEN the system SHALL show their check-ins in real-time without page refresh
3. WHEN the session state changes (pending → active → complete) THEN the UI SHALL update automatically to reflect the current state
4. WHEN the session timer counts down THEN it SHALL use server-side timing data rather than client-side calculations

### Requirement 2

**User Story:** As a lecturer, I want to see detailed information about each student's check-in attempt, so that I can verify attendance accuracy and handle edge cases.

#### Acceptance Criteria

1. WHEN a student checks in successfully THEN the system SHALL display their name, registration number, check-in time, and GPS accuracy
2. WHEN a student's GPS is outside the required radius THEN the system SHALL show their distance from the session location
3. WHEN a student fails to check in due to GPS or code issues THEN the system SHALL display the appropriate error status
4. WHEN attendance records are displayed THEN they SHALL be sorted by check-in time with the most recent first

<!-- ### Requirement 3

**User Story:** As a lecturer, I want to manually override attendance for students with technical issues, so that I can ensure fair attendance tracking.

#### Acceptance Criteria

1. WHEN a student has a failed check-in status THEN the lecturer SHALL be able to manually mark them as present
2. WHEN performing a manual override THEN the lecturer SHALL be required to provide a reason
3. WHEN an override is applied THEN the system SHALL record the override reason and mark the record as manually adjusted
4. WHEN viewing attendance records THEN manually overridden records SHALL be clearly distinguished from automatic check-ins -->

### Requirement 4

**User Story:** As a lecturer, I want to copy the attendance code easily, so that I can share it with students quickly during the session.

#### Acceptance Criteria

1. WHEN an attendance session requires a code THEN the system SHALL display the code prominently
2. WHEN the lecturer clicks the copy button THEN the attendance code SHALL be copied to their clipboard
3. WHEN the code is copied THEN the system SHALL provide visual feedback confirming the action
4. WHEN no attendance code is required THEN the code section SHALL not be displayed

### Requirement 5

**User Story:** As a lecturer, I want to see loading states while data is being fetched, so that I understand the system is working and not frozen.

#### Acceptance Criteria

1. WHEN the attendance session page is loading THEN the system SHALL display an appropriate loading skeleton
2. WHEN attendance records are being fetched THEN the system SHALL show loading indicators in the student list area
3. WHEN real-time updates are being processed THEN the system SHALL maintain smooth UI transitions
4. WHEN network issues occur THEN the system SHALL display appropriate error states with retry options

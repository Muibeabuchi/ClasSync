# Requirements Document

## Introduction

This feature enables lecturers to manually mark students as present after an attendance session has ended, addressing real-world scenarios where students miss check-in due to technical issues such as poor GPS signal, dead battery, temporarily stepping out of class, or other valid human or technical errors. The system must maintain accountability through mandatory justification notes and comprehensive audit logging while preventing abuse through time-based restrictions and clear visual indicators.

## Requirements

### Requirement 1

**User Story:** As a lecturer, I want to manually mark absent students as present after a session ends, so that I can account for technical issues or valid circumstances that prevented automatic check-in.

#### Acceptance Criteria

1. WHEN an attendance session has ended THEN the lecturer SHALL be able to access manual override functionality for absent students
2. WHEN a student is already marked as present THEN the manual override option SHALL NOT be available for that student
3. WHEN performing a manual override THEN the lecturer SHALL be required to provide a justification note of at least 15 characters, while being clearly informed to give a clear, descriptive message.
4. WHEN the manual override is confirmed THEN the student's attendance status SHALL be updated to present with a clear indicator that it was manually overridden

### Requirement 2

**User Story:** As a lecturer, I want to see clear statistics about attendance patterns, so that I can understand the distribution of automatic vs manual attendance marking.

#### Acceptance Criteria

1. WHEN viewing an attendance session detail page THEN the system SHALL display the count of students marked present via normal check-in flow
2. WHEN viewing an attendance session detail page THEN the system SHALL display the count of students who were absent
3. WHEN viewing attendance records THEN manually overridden records SHALL be visually distinguished from automatic check-ins with appropriate icons and labels
4. WHEN viewing session statistics THEN the system SHALL show the breakdown of automatic vs manual attendance marking

### Requirement 3

**User Story:** As a lecturer, I want a streamlined interface for performing manual overrides, so that I can efficiently handle multiple cases without friction.

#### Acceptance Criteria

1. WHEN viewing absent students THEN each SHALL have a clearly labeled "Mark as Present" button
2. WHEN clicking "Mark as Present" THEN a modal SHALL open requiring justification input before confirmation. This modal should be a Drawer on smaller screens to ensure mobile responsiveness.
3. WHEN the justification note is less than 15 characters THEN the system SHALL prevent submission and show validation feedback. This should be encoded into the ZOD SCHEMA.
4. WHEN the override is successful THEN the UI SHALL immediately reflect the change without requiring page refresh

### Requirement 4

**User Story:** As a system administrator, I want comprehensive audit trails for manual overrides, so that I can ensure accountability and prevent abuse of the override system.

#### Acceptance Criteria

1. WHEN a manual override is performed THEN the system SHALL record the lecturer ID, timestamp, student ID, session ID, and justification note
2. WHEN a manual override is performed THEN the system SHALL store the original attendance status and the override details
3. WHEN viewing attendance records THEN the system SHALL clearly indicate which records were manually overridden
4. WHEN an override is attempted outside the allowed time window THEN the system SHALL prevent the action and log the attempt

### Requirement 5

**User Story:** As a lecturer, I want time-based restrictions on manual overrides, so that the system maintains integrity while allowing reasonable flexibility for legitimate cases.

#### Acceptance Criteria

1. WHEN an attendance session is still active THEN manual override functionality SHALL NOT be available
2. WHEN more than 24 hours have passed since session end THEN manual override functionality SHALL be disabled
3. WHEN attempting an override outside the allowed time window THEN the system SHALL display an appropriate error message. The allowed time window should be a setting option for the lecturer as well which they can adjust between 1 hr to 24 hrs.
4. WHEN within the valid override window THEN the system SHALL clearly indicate the remaining time available for overrides

### Requirement 6

**User Story:** As a lecturer, I want clear visual feedback about override actions, so that I can understand the current state and any limitations of the override system.

#### Acceptance Criteria

1. WHEN viewing the attendance session page THEN manually overridden students SHALL be marked with distinct visual indicators (icons and styling)
2. WHEN hovering over override indicators THEN tooltips SHALL show the override timestamp and justification note
3. WHEN the override time window is approaching expiration THEN the system SHALL display a warning message
4. WHEN no overrides are possible THEN the interface SHALL clearly communicate why (time expired, all students present, etc.)

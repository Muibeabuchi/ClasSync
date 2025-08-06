# Implementation Plan

- [x] 1. Database Schema Extensions and Migrations
  - Extend the existing `attendanceRecords` table with override-related fields
  - Create new `attendanceOverrideLogs` table for comprehensive audit logging
  - Create `lecturerSettings` table for configurable override time windows
  - Add proper indexes for efficient querying of override data
  - _Requirements: 1.4, 4.1, 4.2, 5.3_

-

- [-] 2. Backend Validation and Business Logic

- [x] 2.1 Create ZOD validation schemas for override operations
  - Implement `overrideJustificationSchema` with 15-100 character validation
  - Create `lecturerOverrideSettingsSchema` for time window settings (1-24 hours)
  - Add validation for override eligibility and time window checks
  - _Requirements: 3.3, 5.2, 5.3_

- [x] 2.2 Implement override eligibility calculation logic
  - Create function to calculate time window eligibility based on session end time
  - Implement lecturer settings integration for configurable time windows
  - Add validation to prevent overrides during active sessions
  - Create comprehensive error handling with descriptive messages
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 3. Convex Query Functions for Data Retrieval

- [x] 3.1 Create enhanced attendance session query with override metadata
  - Implement `getAttendanceSessionWithOverrideInfo` query
  - Include override eligibility calculation and time window information
  - Integrate lecturer settings for personalized time windows
  - Add real-time reactivity for session state changes
  - _Requirements: 1.1, 5.4, 6.3_

- [x] 3.2 Implement attendance records query with override indicators
  - Create `getAttendanceRecordsWithOverrides` query
  - Populate student information and override status for each record
  - Include visual indicators for manually overridden records
  - Sort records appropriately with override status clearly marked
  - _Requirements: 2.3, 6.1, 6.2_

- [x] 3.3 Create comprehensive attendance statistics query
  - Implement `getAttendanceStatistics` query for session overview
  - Calculate automatic check-ins vs manual overrides breakdown
  - Include total enrolled students and absent student counts
  - Provide data for progress indicators and visual statistics
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 4. Convex Mutation Functions for Override Operations

- [x] 4.1 Implement manual attendance override mutation
  - Create `createManualAttendanceOverride` mutation with comprehensive validation
  - Validate lecturer permissions and course ownership
  - Check time window eligibility and prevent duplicate overrides
  - Create or update attendance record with override metadata
  - Generate audit log entry with all required information
  - _Requirements: 1.1, 1.3, 1.4, 4.1, 4.2_

- [x] 4.2 Create lecturer settings management mutation
  - Implement `updateLecturerOverrideSettings` mutation
  - Validate time window settings within 1-24 hour range
  - Create or update lecturer-specific override preferences
  - Ensure settings are applied to future override eligibility calculations
  - _Requirements: 5.3_

- [x] 5. Custom React Hooks with TanStack Query Integration

- [x] 5.1 Create manual attendance override hook
  - Implement `useManualAttendanceOverride` hook following established patterns
  - Integrate TanStack Query with Convex mutations for optimal caching
  - Encapsulate success and error handling logic within the hook
  - Implement proper cache invalidation for affected queries
  - Add loading states and error management
  - _Requirements: 1.4, 3.4_

- [x] 5.2 Implement attendance session data hook with override information
  - Create `useAttendanceSessionWithOverrides` hook
  - Combine session data, attendance records, and statistics in single hook
  - Leverage TanStack Query caching for efficient data management
  - Implement real-time updates through Convex reactivity
  - Handle loading states for multiple concurrent queries
  - _Requirements: 2.1, 2.2, 2.3, 6.1_

- [x] 6. Enhanced Attendance Session Detail Page

- [x] 6.1 Update session detail page with override functionality
  - Integrate new hooks for real-time data with override information
  - Add override eligibility checks and time window display
  - Implement responsive layout using Shadcn UI components
  - Show clear statistics breakdown of automatic vs manual attendance
  - Display time remaining for override window with visual indicators
  - _Requirements: 2.1, 2.2, 5.4, 6.3_

- [x] 6.2 Create attendance statistics card component
  - Build `AttendanceStatisticsCard` using Shadcn UI Card components
  - Display total enrolled, automatic check-ins, manual overrides, and absent counts
  - Implement progress indicators for overall attendance percentage
  - Add visual indicators for override window status and remaining time
  - Ensure mobile-responsive design with proper spacing and typography
  - _Requirements: 2.1, 2.2, 2.4, 6.3_
-

- [x] 7. Student Attendance Row Components with Override Actions

- [x] 7.1 Enhance student attendance row with override indicators
  - Update `StudentAttendanceRow` component with override visual indicators
  - Add distinct icons and styling for manually overridden records
  - Implement tooltips showing override timestamp and justification
  - Include "Mark as Present" button for absent students when eligible
  - Ensure accessibility with proper ARIA labels and keyboard navigation
  - _Requirements: 1.2, 3.1, 6.1, 6.2_

- [x] 7.2 Create override action buttons and controls
  - Implement clearly labeled "Mark as Present" buttons for absent students
  - Add proper disabled states when overrides are not available
  - Include visual feedback for button interactions and loading states
  - Ensure touch-friendly design for mobile devices
  - Add confirmation dialogs to prevent accidental overrides
  - _Requirements: 3.1, 3.4_

- [x] 8. Manual Override Modal/Drawer Component

- [x] 8.1 Create responsive override dialog component
  - Build `ManualOverrideDialog` component using Shadcn UI Dialog and Drawer
  - Implement responsive behavior: Modal on desktop, Drawer on mobile
  - Use `useMediaQuery` hook for proper responsive switching
  - Include student information display and justification input form
  - Add character count validation with real-time feedback
  - _Requirements: 3.2, 3.3_

- [x] 8.2 Implement form validation and submission logic
  - Integrate ZOD schema validation for justification note requirements
  - Add real-time character count with minimum 15 character validation
  - Implement form submission with loading states and error handling
  - Provide clear guidance text for justification requirements
  - Add proper form accessibility with labels and error messages
  - _Requirements: 1.3, 3.3, 3.4_

- [x] 9. Visual Indicators and UI Feedback Systems

- [x] 9.1 Create override status indicators and icons
  - Design distinct visual indicators for manually overridden records
  - Implement appropriate icons using Lucide React icon library
  - Add color coding and styling to differentiate override types
  - Create tooltips with override details (timestamp, reason, lecturer)
  - Ensure sufficient color contrast for accessibility compliance
  - _Requirements: 6.1, 6.2_

- [x] 9.2 Implement time window warnings and notifications
  - Add visual warnings when override window is approaching expiration
  - Display clear messages when override functionality is unavailable
  - Implement countdown timers for remaining override window time
  - Create informative error states with actionable guidance
  - Add toast notifications for successful override operations
  - _Requirements: 5.4, 6.3, 6.4_

- [x] 10. Error Handling and Edge Case Management

- [x] 10.1 Implement comprehensive error handling system
  - Create error type definitions using objects instead of enums
  - Implement error message mapping with contextual information
  - Add proper error boundaries for component-level error handling
  - Create user-friendly error states with recovery options
  - Implement logging for failed override attempts and system errors
  - _Requirements: 4.4, 5.2, 6.4_

- [x] 10.2 Handle edge cases and validation scenarios
  - Prevent overrides for students already marked present
  - Handle concurrent override attempts by multiple lecturers
  - Validate session ownership and lecturer permissions
  - Implement proper handling of expired override windows
  - Add validation for malformed or insufficient justification notes
  - _Requirements: 1.2, 4.4, 5.1, 5.2_

- [x] 11. Mobile Responsiveness and Accessibility

- [x] 11.1 Ensure mobile-first responsive design
  - Implement proper breakpoints for all override-related components
  - Test Modal to Drawer transitions on various screen sizes
  - Ensure touch-friendly button sizes and interaction areas
  - Optimize layout spacing and typography for mobile devices
  - Test gesture-based interactions and mobile-specific behaviors
  - _Requirements: 3.2_

- [x] 11.2 Implement accessibility standards compliance
  - Add proper ARIA labels for all override-related UI elements
  - Ensure keyboard navigation support for all interactive components
  - Implement screen reader compatibility for override indicators
  - Test color contrast ratios for visual indicators and status elements
  - Add focus management for modal and drawer components
  - _Requirements: 6.1, 6.2_

- [ ] 12. Testing and Quality Assurance
- [ ] 12.1 Create unit tests for override business logic
  - Test override eligibility calculation with various time scenarios
  - Validate ZOD schema validation with edge cases and boundary conditions
  - Test permission checking and lecturer authorization logic
  - Create tests for error handling and edge case scenarios
  - Test hook functionality with mocked Convex operations
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2_

- [ ] 12.2 Implement integration tests for override workflow
  - Test complete override flow from UI interaction to database update
  - Validate real-time UI updates after successful override operations
  - Test audit log creation and retrieval functionality
  - Verify cache invalidation and data synchronization
  - Test mobile responsiveness and cross-device compatibility
  - _Requirements: 1.4, 3.4, 4.1, 4.2_

- [ ] 13. Performance Optimization and Monitoring
- [ ] 13.1 Optimize query performance and caching strategies
  - Implement efficient database indexes for override-related queries
  - Optimize TanStack Query caching patterns for override data
  - Test performance with large student lists and multiple override operations
  - Implement proper query dependencies and cache invalidation
  - Monitor and optimize real-time update performance
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 13.2 Implement monitoring and analytics for override usage
  - Add logging for override operation frequency and patterns
  - Monitor system performance during peak override usage
  - Track error rates and common failure scenarios
  - Implement alerts for unusual override activity or system issues
  - Create dashboards for override usage analytics and system health
  - _Requirements: 4.1, 4.2, 4.4_

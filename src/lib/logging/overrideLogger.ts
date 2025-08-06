// /**
//  * Logging system for manual attendance override operations
//  * Requirements: 4.4 - Logging for failed override attempts and system errors
//  */

// import {
//   // OverrideError,
//   // OverrideErrorType,
//   ErrorSeverity,
//   formatErrorForLogging,
//   type OverrideError,
// } from '@/lib/errors/overrideErrors';

// /**
//  * Log levels for different types of events
//  */
// export const LogLevel = {
//   DEBUG: 'debug',
//   INFO: 'info',
//   WARN: 'warn',
//   ERROR: 'error',
//   CRITICAL: 'critical',
// } as const;

// export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

// /**
//  * Log entry interface
//  */
// export interface OverrideLogEntry {
//   id: string;
//   timestamp: number;
//   level: LogLevel;
//   category: string;
//   message: string;
//   data?: Record<string, any>;
//   userId?: string;
//   sessionId?: string;
//   studentId?: string;
//   courseId?: string;
//   userAgent?: string;
//   url?: string;
//   stackTrace?: string;
// }

// /**
//  * Logger configuration
//  */
// interface LoggerConfig {
//   enableConsoleLogging: boolean;
//   enableRemoteLogging: boolean;
//   logLevel: LogLevel;
//   maxLocalStorageEntries: number;
//   remoteEndpoint?: string;
//   apiKey?: string;
// }

// /**
//  * Default logger configuration
//  */
// const DEFAULT_CONFIG: LoggerConfig = {
//   enableConsoleLogging: true,
//   enableRemoteLogging: false,
//   logLevel: LogLevel.INFO,
//   maxLocalStorageEntries: 1000,
// };

// /**
//  * Override operation logger class
//  */
// class OverrideLogger {
//   private config: LoggerConfig;
//   private logQueue: OverrideLogEntry[] = [];
//   private isFlushingQueue = false;

//   constructor(config: Partial<LoggerConfig> = {}) {
//     this.config = { ...DEFAULT_CONFIG, ...config };
//     this.initializeLogger();
//   }

//   private initializeLogger() {
//     // Set up error handlers
//     if (typeof window !== 'undefined') {
//       window.addEventListener('error', this.handleGlobalError.bind(this));
//       window.addEventListener(
//         'unhandledrejection',
//         this.handleUnhandledRejection.bind(this),
//       );
//     }
//   }

//   private handleGlobalError(event: ErrorEvent) {
//     this.error('Global error caught', {
//       message: event.message,
//       filename: event.filename,
//       lineno: event.lineno,
//       colno: event.colno,
//       stack: event.error?.stack,
//     });
//   }

//   private handleUnhandledRejection(event: PromiseRejectionEvent) {
//     this.error('Unhandled promise rejection', {
//       reason: event.reason,
//       stack: event.reason?.stack,
//     });
//   }

//   /**
//    * Generate unique log entry ID
//    */
//   private generateLogId(): string {
//     return `override_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   }

//   /**
//    * Get current user context
//    */
//   private getUserContext(): Partial<OverrideLogEntry> {
//     if (typeof window === 'undefined') {
//       return {};
//     }

//     return {
//       userAgent: navigator.userAgent,
//       url: window.location.href,
//       // Add user ID from your auth system
//       // userId: getCurrentUserId(),
//     };
//   }

//   /**
//    * Create log entry
//    */
//   private createLogEntry(
//     level: LogLevel,
//     category: string,
//     message: string,
//     data?: Record<string, any>,
//     context?: Partial<OverrideLogEntry>,
//   ): OverrideLogEntry {
//     return {
//       id: this.generateLogId(),
//       timestamp: Date.now(),
//       level,
//       category,
//       message,
//       data,
//       ...this.getUserContext(),
//       ...context,
//     };
//   }

//   /**
//    * Check if log level should be processed
//    */
//   private shouldLog(level: LogLevel): boolean {
//     const levels = [
//       LogLevel.DEBUG,
//       LogLevel.INFO,
//       LogLevel.WARN,
//       LogLevel.ERROR,
//       LogLevel.CRITICAL,
//     ];
//     const currentLevelIndex = levels.indexOf(this.config.logLevel);
//     const messageLevelIndex = levels.indexOf(level);
//     return messageLevelIndex >= currentLevelIndex;
//   }

//   /**
//    * Process log entry
//    */
//   private processLogEntry(entry: OverrideLogEntry) {
//     if (!this.shouldLog(entry.level)) {
//       return;
//     }

//     // Console logging
//     if (this.config.enableConsoleLogging) {
//       this.logToConsole(entry);
//     }

//     // Store in local storage for debugging
//     this.storeLocally(entry);

//     // Add to queue for remote logging
//     if (this.config.enableRemoteLogging) {
//       this.logQueue.push(entry);
//       this.flushLogQueue();
//     }
//   }

//   /**
//    * Log to browser console
//    */
//   private logToConsole(entry: OverrideLogEntry) {
//     const logMethod =
//       entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL
//         ? console.error
//         : entry.level === LogLevel.WARN
//           ? console.warn
//           : console.log;

//     logMethod(
//       `[${new Date(entry.timestamp).toISOString()}] [${entry.level.toUpperCase()}] [${entry.category}] ${entry.message}`,
//       entry.data || {},
//     );
//   }

//   /**
//    * Store log entry in local storage
//    */
//   private storeLocally(entry: OverrideLogEntry) {
//     if (typeof window === 'undefined') {
//       return;
//     }

//     try {
//       const storageKey = 'override_logs';
//       const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');

//       existingLogs.push(entry);

//       // Keep only the most recent entries
//       if (existingLogs.length > this.config.maxLocalStorageEntries) {
//         existingLogs.splice(
//           0,
//           existingLogs.length - this.config.maxLocalStorageEntries,
//         );
//       }

//       localStorage.setItem(storageKey, JSON.stringify(existingLogs));
//     } catch (error) {
//       console.warn('Failed to store log entry locally:', error);
//     }
//   }

//   /**
//    * Flush log queue to remote endpoint
//    */
//   private async flushLogQueue() {
//     if (
//       this.isFlushingQueue ||
//       this.logQueue.length === 0 ||
//       !this.config.remoteEndpoint
//     ) {
//       return;
//     }

//     this.isFlushingQueue = true;
//     const logsToSend = [...this.logQueue];
//     this.logQueue = [];

//     try {
//       await fetch(this.config.remoteEndpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(this.config.apiKey && {
//             Authorization: `Bearer ${this.config.apiKey}`,
//           }),
//         },
//         body: JSON.stringify({ logs: logsToSend }),
//       });
//     } catch (error) {
//       console.warn('Failed to send logs to remote endpoint:', error);
//       // Re-add logs to queue for retry
//       this.logQueue.unshift(...logsToSend);
//     } finally {
//       this.isFlushingQueue = false;
//     }
//   }

//   /**
//    * Debug level logging
//    */
//   debug(
//     message: string,
//     data?: Record<string, any>,
//     context?: Partial<OverrideLogEntry>,
//   ) {
//     const entry = this.createLogEntry(
//       LogLevel.DEBUG,
//       'override',
//       message,
//       data,
//       context,
//     );
//     this.processLogEntry(entry);
//   }

//   /**
//    * Info level logging
//    */
//   info(
//     message: string,
//     data?: Record<string, any>,
//     context?: Partial<OverrideLogEntry>,
//   ) {
//     const entry = this.createLogEntry(
//       LogLevel.INFO,
//       'override',
//       message,
//       data,
//       context,
//     );
//     this.processLogEntry(entry);
//   }

//   /**
//    * Warning level logging
//    */
//   warn(
//     message: string,
//     data?: Record<string, any>,
//     context?: Partial<OverrideLogEntry>,
//   ) {
//     const entry = this.createLogEntry(
//       LogLevel.WARN,
//       'override',
//       message,
//       data,
//       context,
//     );
//     this.processLogEntry(entry);
//   }

//   /**
//    * Error level logging
//    */
//   error(
//     message: string,
//     data?: Record<string, any>,
//     context?: Partial<OverrideLogEntry>,
//   ) {
//     const entry = this.createLogEntry(
//       LogLevel.ERROR,
//       'override',
//       message,
//       data,
//       context,
//     );
//     this.processLogEntry(entry);
//   }

//   /**
//    * Critical level logging
//    */
//   critical(
//     message: string,
//     data?: Record<string, any>,
//     context?: Partial<OverrideLogEntry>,
//   ) {
//     const entry = this.createLogEntry(
//       LogLevel.CRITICAL,
//       'override',
//       message,
//       data,
//       context,
//     );
//     this.processLogEntry(entry);
//   }

//   /**
//    * Log override error with full context
//    */
//   logOverrideError(error: OverrideError, context?: Partial<OverrideLogEntry>) {
//     const logLevel = this.getLogLevelFromErrorSeverity(error.severity);
//     const logData = {
//       ...formatErrorForLogging(error),
//       errorType: error.type,
//       userMessage: error.userMessage,
//       recoverable: error.recoverable,
//       retryable: error.retryable,
//     };

//     const entry = this.createLogEntry(
//       logLevel,
//       'override_error',
//       `Override operation failed: ${error.message}`,
//       logData,
//       context,
//     );

//     this.processLogEntry(entry);
//   }

//   /**
//    * Log successful override operation
//    */
//   logOverrideSuccess(data: {
//     sessionId: string;
//     studentId: string;
//     lecturerId: string;
//     courseId: string;
//     justificationNote: string;
//     overrideTimestamp: string;
//   }) {
//     this.info(
//       'Override operation successful',
//       {
//         operation: 'manual_override',
//         ...data,
//       },
//       {
//         sessionId: data.sessionId,
//         studentId: data.studentId,
//         courseId: data.courseId,
//       },
//     );
//   }

//   /**
//    * Log override attempt
//    */
//   logOverrideAttempt(data: {
//     sessionId: string;
//     studentId: string;
//     lecturerId: string;
//     courseId: string;
//     justificationLength: number;
//   }) {
//     this.info(
//       'Override attempt initiated',
//       {
//         operation: 'override_attempt',
//         ...data,
//       },
//       {
//         sessionId: data.sessionId,
//         studentId: data.studentId,
//         courseId: data.courseId,
//       },
//     );
//   }

//   /**
//    * Log validation failure
//    */
//   logValidationFailure(
//     validationType: string,
//     errors: string[],
//     context?: Partial<OverrideLogEntry>,
//   ) {
//     this.warn(
//       `Validation failed: ${validationType}`,
//       {
//         validationType,
//         errors,
//         errorCount: errors.length,
//       },
//       context,
//     );
//   }

//   /**
//    * Log permission check
//    */
//   logPermissionCheck(
//     result: 'granted' | 'denied',
//     context?: Partial<OverrideLogEntry>,
//   ) {
//     const level = result === 'denied' ? LogLevel.WARN : LogLevel.DEBUG;
//     const entry = this.createLogEntry(
//       level,
//       'permission',
//       `Permission check: ${result}`,
//       { permissionResult: result },
//       context,
//     );
//     this.processLogEntry(entry);
//   }

//   /**
//    * Convert error severity to log level
//    */
//   private getLogLevelFromErrorSeverity(severity: ErrorSeverity): LogLevel {
//     const severityMap: Record<ErrorSeverity, LogLevel> = {
//       [ErrorSeverity.LOW]: LogLevel.INFO,
//       [ErrorSeverity.MEDIUM]: LogLevel.WARN,
//       [ErrorSeverity.HIGH]: LogLevel.ERROR,
//       [ErrorSeverity.CRITICAL]: LogLevel.CRITICAL,
//     };

//     return severityMap[severity] || LogLevel.ERROR;
//   }

//   /**
//    * Get logs from local storage
//    */
//   getLocalLogs(): OverrideLogEntry[] {
//     if (typeof window === 'undefined') {
//       return [];
//     }

//     try {
//       const storageKey = 'override_logs';
//       return JSON.parse(localStorage.getItem(storageKey) || '[]');
//     } catch (error) {
//       console.warn('Failed to retrieve local logs:', error);
//       return [];
//     }
//   }

//   /**
//    * Clear local logs
//    */
//   clearLocalLogs() {
//     if (typeof window === 'undefined') {
//       return;
//     }

//     try {
//       localStorage.removeItem('override_logs');
//     } catch (error) {
//       console.warn('Failed to clear local logs:', error);
//     }
//   }

//   /**
//    * Export logs for debugging
//    */
//   exportLogs(): string {
//     const logs = this.getLocalLogs();
//     return JSON.stringify(logs, null, 2);
//   }

//   /**
//    * Update logger configuration
//    */
//   updateConfig(newConfig: Partial<LoggerConfig>) {
//     this.config = { ...this.config, ...newConfig };
//   }
// }

// /**
//  * Global logger instance
//  */
// export const overrideLogger = new OverrideLogger({
//   enableConsoleLogging: process.env.NODE_ENV === 'development',
//   enableRemoteLogging: process.env.NODE_ENV === 'production',
//   logLevel:
//     process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
//   remoteEndpoint: process.env.VITE_LOGGING_ENDPOINT,
//   apiKey: process.env.VITE_LOGGING_API_KEY,
// });

// /**
//  * Hook for using the override logger in React components
//  */
// export const useOverrideLogger = () => {
//   return {
//     logError: overrideLogger.logOverrideError.bind(overrideLogger),
//     logSuccess: overrideLogger.logOverrideSuccess.bind(overrideLogger),
//     logAttempt: overrideLogger.logOverrideAttempt.bind(overrideLogger),
//     logValidationFailure:
//       overrideLogger.logValidationFailure.bind(overrideLogger),
//     logPermissionCheck: overrideLogger.logPermissionCheck.bind(overrideLogger),
//     debug: overrideLogger.debug.bind(overrideLogger),
//     info: overrideLogger.info.bind(overrideLogger),
//     warn: overrideLogger.warn.bind(overrideLogger),
//     error: overrideLogger.error.bind(overrideLogger),
//     critical: overrideLogger.critical.bind(overrideLogger),
//   };
// };

// /**
//  * Utility function to create error context from React component props
//  */
// export const createErrorContext = (props: {
//   sessionId?: string;
//   studentId?: string;
//   courseId?: string;
//   [key: string]: any;
// }): Partial<OverrideLogEntry> => {
//   return {
//     sessionId: props.sessionId,
//     studentId: props.studentId,
//     courseId: props.courseId,
//   };
// };

// export default overrideLogger;

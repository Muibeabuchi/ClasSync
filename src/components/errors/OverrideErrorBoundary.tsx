/**
 * Error boundary component for manual attendance override operations
 * Requirements: 4.4, 6.4 - Component-level error handling with user-friendly error states
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  OverrideError,
  OverrideErrorType,
  createOverrideError,
  getRecoverySuggestions,
  formatErrorForLogging,
} from '@/lib/errors/overrideErrors';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<OverrideErrorBoundaryFallbackProps>;
  onError?: (error: OverrideError, errorInfo: React.ErrorInfo) => void;
  context?: {
    sessionId?: string;
    studentId?: string;
    lecturerId?: string;
    courseId?: string;
  };
}

interface State {
  hasError: boolean;
  error: OverrideError | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface OverrideErrorBoundaryFallbackProps {
  error: OverrideError;
  errorInfo: React.ErrorInfo | null;
  retry: () => void;
  goHome: () => void;
  retryCount: number;
}

/**
 * Error boundary specifically designed for override operations
 * Provides contextual error handling and recovery options
 */
export class OverrideErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Convert the error to our override error format
    const overrideError = createOverrideError(OverrideErrorType.UNKNOWN_ERROR, {
      originalError: error.message,
      stack: error.stack,
    });

    return {
      hasError: true,
      error: overrideError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const overrideError = createOverrideError(OverrideErrorType.UNKNOWN_ERROR, {
      originalError: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      ...this.props.context,
    });

    this.setState({
      error: overrideError,
      errorInfo,
    });

    // Log the error
    this.logError(overrideError, errorInfo);

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(overrideError, errorInfo);
    }
  }

  private logError = (error: OverrideError, errorInfo: React.ErrorInfo) => {
    const logData = {
      ...formatErrorForLogging(error),
      componentStack: errorInfo.componentStack,
      errorBoundary: 'OverrideErrorBoundary',
      retryCount: this.state.retryCount,
    };

    console.error('Override Error Boundary caught error:', logData);

    // In a real application, you would send this to your error reporting service
    // Example: Sentry.captureException(error, { extra: logData });
  };

  private retry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private goHome = () => {
    // Navigate to home or dashboard
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent =
        this.props.fallback || DefaultOverrideErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retry={this.retry}
          goHome={this.goHome}
          retryCount={this.state.retryCount}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component for override operations
 */
const DefaultOverrideErrorFallback: React.FC<
  OverrideErrorBoundaryFallbackProps
> = ({ error, retry, goHome, retryCount }) => {
  const maxRetries = 3;
  const canRetry = error.retryable && retryCount < maxRetries;
  const suggestions = getRecoverySuggestions(error.type);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Override Operation Failed</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              {error.userMessage}
            </AlertDescription>
          </Alert>

          {error.code && (
            <div className="text-xs text-muted-foreground text-center">
              Error Code: {error.code}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">What you can do:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-xs mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={goHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>

            {canRetry && (
              <Button onClick={retry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again ({maxRetries - retryCount} left)
              </Button>
            )}
          </div>

          {retryCount >= maxRetries && error.retryable && (
            <Alert>
              <AlertDescription className="text-xs">
                Maximum retry attempts reached. Please refresh the page or
                contact support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Specialized error fallback for override modal/dialog errors
 */
export const OverrideModalErrorFallback: React.FC<
  OverrideErrorBoundaryFallbackProps
> = ({ error, retry, retryCount }) => {
  const maxRetries = 3;
  const canRetry = error.retryable && retryCount < maxRetries;

  return (
    <div className="p-6 text-center space-y-4">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Override Failed</h3>
        <p className="text-sm text-muted-foreground">{error.userMessage}</p>
      </div>

      {canRetry && (
        <Button onClick={retry} size="sm" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}

      {error.code && (
        <div className="text-xs text-muted-foreground">Error: {error.code}</div>
      )}
    </div>
  );
};

/**
 * Hook to use error boundary context
 */
export const useOverrideErrorHandler = () => {
  const handleError = React.useCallback((error: unknown, context?: any) => {
    // This would typically integrate with your error reporting service
    const overrideError =
      error instanceof Error
        ? createOverrideError(OverrideErrorType.UNKNOWN_ERROR, {
            originalError: error.message,
            ...context,
          })
        : createOverrideError(OverrideErrorType.UNKNOWN_ERROR, context);

    console.error(
      'Override operation error:',
      formatErrorForLogging(overrideError),
    );

    // Re-throw to let error boundary catch it
    throw overrideError;
  }, []);

  return { handleError };
};

/**
 * Higher-order component to wrap components with override error boundary
 */
export const withOverrideErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>,
) => {
  const WrappedComponent = (props: P) => (
    <OverrideErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </OverrideErrorBoundary>
  );

  WrappedComponent.displayName = `withOverrideErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default OverrideErrorBoundary;

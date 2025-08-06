/**
 * User-friendly error state components for override operations
 * Requirements: 6.4 - Error states with recovery options
 */

import React from 'react';
import {
  AlertTriangle,
  Clock,
  Shield,
  UserX,
  RefreshCw,
  Home,
  CheckCircle,
  XCircle,
  Wifi,
  Database,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  OverrideError,
  OverrideErrorType,
  getRecoverySuggestions,
} from '@/lib/errors/overrideErrors';

interface ErrorStateProps {
  error: OverrideError;
  onRetry?: () => void;
  onDismiss?: () => void;
  onGoHome?: () => void;
  showRetryButton?: boolean;
  showDismissButton?: boolean;
  compact?: boolean;
}

/**
 * Get appropriate icon for error type
 */
const getErrorIcon = (errorType: OverrideErrorType) => {
  const iconMap: Record<
    OverrideErrorType,
    React.ComponentType<{ className?: string }>
  > = {
    [OverrideErrorType.SESSION_STILL_ACTIVE]: Clock,
    [OverrideErrorType.SESSION_NOT_FOUND]: AlertTriangle,
    [OverrideErrorType.INVALID_SESSION_STATUS]: AlertTriangle,
    [OverrideErrorType.TIME_WINDOW_EXPIRED]: Clock,
    [OverrideErrorType.TIME_WINDOW_INVALID]: Clock,
    [OverrideErrorType.STUDENT_ALREADY_PRESENT]: CheckCircle,
    [OverrideErrorType.STUDENT_NOT_ENROLLED]: UserX,
    [OverrideErrorType.STUDENT_NOT_FOUND]: UserX,
    [OverrideErrorType.PERMISSION_DENIED]: Shield,
    [OverrideErrorType.UNAUTHORIZED]: Shield,
    [OverrideErrorType.LECTURER_NOT_OWNER]: Shield,
    [OverrideErrorType.INSUFFICIENT_JUSTIFICATION]: AlertCircle,
    [OverrideErrorType.INVALID_JUSTIFICATION_FORMAT]: AlertCircle,
    [OverrideErrorType.MALFORMED_REQUEST]: AlertTriangle,
    [OverrideErrorType.DUPLICATE_OVERRIDE]: CheckCircle,
    [OverrideErrorType.CONCURRENT_OVERRIDE_ATTEMPT]: RefreshCw,
    [OverrideErrorType.DATABASE_ERROR]: Database,
    [OverrideErrorType.NETWORK_ERROR]: Wifi,
    [OverrideErrorType.UNKNOWN_ERROR]: XCircle,
    [OverrideErrorType.RATE_LIMIT_EXCEEDED]: Clock,
  };

  return iconMap[errorType] || AlertTriangle;
};

/**
 * Get appropriate color variant for error type
 */
const getErrorVariant = (
  errorType: OverrideErrorType,
): 'destructive' | 'secondary' | 'outline' => {
  const highSeverityErrors = new Set([
    OverrideErrorType.DATABASE_ERROR,
    OverrideErrorType.UNKNOWN_ERROR,
    OverrideErrorType.PERMISSION_DENIED,
    OverrideErrorType.UNAUTHORIZED,
  ]);

  const infoErrors = new Set([
    OverrideErrorType.STUDENT_ALREADY_PRESENT,
    OverrideErrorType.DUPLICATE_OVERRIDE,
  ]);

  if (highSeverityErrors.has(errorType)) {
    return 'destructive';
  }

  if (infoErrors.has(errorType)) {
    return 'secondary';
  }

  return 'outline';
};

/**
 * Main error state component
 */
export const OverrideErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onDismiss,
  onGoHome,
  showRetryButton = true,
  showDismissButton = true,
  compact = false,
}) => {
  const Icon = getErrorIcon(error.type);
  const variant = getErrorVariant(error.type);
  const suggestions = getRecoverySuggestions(error.type);
  const canRetry = error.retryable && showRetryButton && onRetry;

  if (compact) {
    return (
      <Alert variant={variant === 'destructive' ? 'destructive' : 'default'}>
        <Icon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error.userMessage}</span>
          <div className="flex gap-2 ml-4">
            {canRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-6 px-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            {showDismissButton && onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 px-2"
              >
                Dismiss
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div
          className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
            variant === 'destructive'
              ? 'bg-destructive/10'
              : variant === 'secondary'
                ? 'bg-muted'
                : 'bg-orange-100'
          }`}
        >
          <Icon
            className={`h-6 w-6 ${
              variant === 'destructive'
                ? 'text-destructive'
                : variant === 'secondary'
                  ? 'text-muted-foreground'
                  : 'text-orange-600'
            }`}
          />
        </div>
        <CardTitle className="text-lg">
          {error.type === OverrideErrorType.STUDENT_ALREADY_PRESENT
            ? 'Student Already Present'
            : error.type === OverrideErrorType.DUPLICATE_OVERRIDE
              ? 'Override Already Applied'
              : 'Override Failed'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert variant={variant === 'destructive' ? 'destructive' : 'default'}>
          <AlertDescription>{error.userMessage}</AlertDescription>
        </Alert>

        {error.severity && (
          <div className="flex justify-center">
            <Badge variant={variant}>
              {error.severity.toUpperCase()} PRIORITY
            </Badge>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-center">
              What you can do:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-xs mt-1 text-primary">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onGoHome && (
            <Button variant="outline" onClick={onGoHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}

          {canRetry && (
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          {!canRetry && showDismissButton && onDismiss && (
            <Button variant="outline" onClick={onDismiss} className="flex-1">
              Dismiss
            </Button>
          )}
        </div>

        {error.code && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Error Code: {error.code}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Inline error state for form fields and smaller components
 */
export const InlineOverrideError: React.FC<{
  error: OverrideError;
  onRetry?: () => void;
  className?: string;
}> = ({ error, onRetry, className = '' }) => {
  const Icon = getErrorIcon(error.type);
  const canRetry = error.retryable && onRetry;

  return (
    <div
      className={`flex items-center gap-2 text-sm text-destructive ${className}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{error.userMessage}</span>
      {canRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-6 px-2 text-destructive hover:text-destructive"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

/**
 * Toast-style error notification
 */
export const OverrideErrorToast: React.FC<{
  error: OverrideError;
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  const Icon = getErrorIcon(error.type);
  const variant = getErrorVariant(error.type);
  const canRetry = error.retryable && onRetry;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${
        variant === 'destructive'
          ? 'bg-destructive/5 border-destructive/20'
          : 'bg-muted/50 border-border'
      }`}
    >
      <Icon
        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
          variant === 'destructive'
            ? 'text-destructive'
            : 'text-muted-foreground'
        }`}
      />

      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">
          Override{' '}
          {error.type === OverrideErrorType.STUDENT_ALREADY_PRESENT
            ? 'Not Needed'
            : 'Failed'}
        </p>
        <p className="text-sm text-muted-foreground">{error.userMessage}</p>
      </div>

      <div className="flex gap-1">
        {canRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-8 px-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 px-2"
          >
            <XCircle className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Network error specific component
 */
export const NetworkErrorState: React.FC<{
  onRetry?: () => void;
  onGoOffline?: () => void;
}> = ({ onRetry, onGoOffline }) => {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <Wifi className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-lg">Connection Problem</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Unable to connect to the server. Please check your internet
          connection.
        </p>

        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {onGoOffline && (
            <Button variant="outline" onClick={onGoOffline} className="flex-1">
              Work Offline
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Permission denied specific component
 */
export const PermissionDeniedState: React.FC<{
  onGoBack?: () => void;
  onContactSupport?: () => void;
}> = ({ onGoBack, onContactSupport }) => {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Shield className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-lg">Access Denied</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          You don't have permission to perform this override operation.
        </p>

        <div className="flex gap-2">
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
          {onContactSupport && (
            <Button onClick={onContactSupport} className="flex-1">
              Contact Support
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Time window expired specific component
 */
export const TimeWindowExpiredState: React.FC<{
  windowHours?: number;
  onGoBack?: () => void;
  onContactSupport?: () => void;
}> = ({ windowHours = 24, onGoBack, onContactSupport }) => {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-6 w-6 text-amber-600" />
        </div>
        <CardTitle className="text-lg">Override Window Closed</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          The {windowHours}-hour window for manual overrides has expired.
        </p>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            For special circumstances, contact your institution's support team.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
          {onContactSupport && (
            <Button onClick={onContactSupport} className="flex-1">
              Contact Support
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OverrideErrorState;

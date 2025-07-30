import React from 'react';
import {
  AlertTriangle,
  WifiOff,
  Clock,
  Zap,
  FileX,
  RefreshCw,
  Download,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ErrorStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'destructive' | 'warning' | 'info' | 'default';
}

export const ErrorState = ({
  title,
  description,
  action,
  secondaryAction,
  icon: Icon = AlertTriangle,
  variant = 'default',
}: ErrorStateProps) => {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'destructive':
        return {
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          titleColor: 'text-red-800',
          descColor: 'text-red-700',
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-800',
          descColor: 'text-yellow-700',
        };
      case 'info':
        return {
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          titleColor: 'text-blue-800',
          descColor: 'text-blue-700',
        };
      default:
        return {
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          titleColor: 'text-gray-800',
          descColor: 'text-gray-700',
        };
    }
  };

  const styles = getVariantStyles(variant);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className={`p-4 rounded-full ${styles.bgColor} mb-4`}>
        <Icon className={`h-8 w-8 ${styles.iconColor}`} />
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${styles.titleColor}`}>
        {title}
      </h3>
      <p className={`${styles.descColor} mb-6 max-w-md`}>{description}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <Button
            onClick={action.onClick}
            disabled={action.disabled}
            variant={variant === 'destructive' ? 'destructive' : 'default'}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
};

// Network Error State
export const NetworkErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <ErrorState
    title="Connection Problem"
    description="Unable to connect to the AI repair service. Please check your internet connection and try again."
    action={{ label: 'Try Again', onClick: onRetry }}
    secondaryAction={{
      label: 'Refresh Page',
      onClick: () => window.location.reload(),
    }}
    icon={WifiOff}
    variant="warning"
  />
);

// AI Service Error State
export const AiServiceErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <ErrorState
    title="AI Service Unavailable"
    description="The AI repair service is temporarily unavailable. This is usually resolved quickly."
    action={{ label: 'Retry AI Repair', onClick: onRetry }}
    secondaryAction={{
      label: 'Manual Fix Guide',
      onClick: () => window.open('/help/csv-format', '_blank'),
    }}
    icon={Zap}
    variant="info"
  />
);

// File Processing Error State
export const FileProcessingErrorState = ({
  onRetry,
}: {
  onRetry: () => void;
}) => (
  <ErrorState
    title="File Processing Failed"
    description="There was an issue processing your CSV file. The file might be corrupted or in an unsupported format."
    action={{ label: 'Try Different File', onClick: onRetry }}
    secondaryAction={{
      label: 'Download Template',
      onClick: () => {
        /* Download CSV template */
      },
    }}
    icon={FileX}
    variant="destructive"
  />
);

// Rate Limit Error State with Countdown
interface RateLimitErrorStateProps {
  retryAfter: number;
  onRetry: () => void;
}

export const RateLimitErrorState = ({
  retryAfter,
  onRetry,
}: RateLimitErrorStateProps) => {
  const [countdown, setCountdown] = React.useState(retryAfter);

  React.useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  const progress = ((retryAfter - countdown) / retryAfter) * 100;

  return (
    <Card className="w-full max-w-md mx-auto border-yellow-200">
      <CardHeader className="bg-yellow-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-yellow-800">
          <Clock className="h-6 w-6" />
          Rate Limit Reached
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You&apos;ve reached the maximum number of AI repair attempts. Please
            wait before trying again.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Time remaining:</span>
            <Badge
              variant="outline"
              className="bg-yellow-100 text-yellow-800 border-yellow-300"
            >
              {formatTime(countdown)}
            </Badge>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground">What you can do:</h4>
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>Wait for the cooldown to end and try AI repair again</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>Manually edit your CSV file and upload it again</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>Download our CSV template for the correct format</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t">
          <Button onClick={onRetry} disabled={countdown > 0} className="w-full">
            {countdown > 0 ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Try Again in {formatTime(countdown)}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try AI Repair Again
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                /* Download template */
              }}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/help/csv-format', '_blank')}
              className="flex-1"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Generic Retry Error State
export const RetryErrorState = ({
  error,
  onRetry,
  maxRetries = 3,
  currentRetry = 0,
}: {
  error: string;
  onRetry: () => void;
  maxRetries?: number;
  currentRetry?: number;
}) => {
  const canRetry = currentRetry < maxRetries;

  return (
    <Card className="w-full max-w-md mx-auto border-red-200">
      <CardHeader className="bg-red-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-red-800">
          <AlertTriangle className="h-6 w-6" />
          Operation Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>

        {canRetry && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Retry attempts:</span>
              <Badge variant="outline">
                {currentRetry} / {maxRetries}
              </Badge>
            </div>
            <Progress
              value={(currentRetry / maxRetries) * 100}
              className="h-2"
            />
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 border-t">
          {canRetry ? (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again ({maxRetries - currentRetry} attempts left)
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Loading Error State (for when something fails during loading)
export const LoadingErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <ErrorState
    title="Loading Failed"
    description="Failed to load the AI repair interface. This might be a temporary issue."
    action={{ label: 'Try Again', onClick: onRetry }}
    secondaryAction={{
      label: 'Refresh Page',
      onClick: () => window.location.reload(),
    }}
    icon={RefreshCw}
    variant="warning"
  />
);

// Not Found Error State
export const NotFoundErrorState = ({ resource }: { resource: string }) => (
  <ErrorState
    title={`${resource} Not Found`}
    description={`The ${resource.toLowerCase()} you're looking for doesn't exist or has been removed.`}
    secondaryAction={{ label: 'Go Back', onClick: () => window.history.back() }}
    icon={FileX}
    variant="info"
  />
);

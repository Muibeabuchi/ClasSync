import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, FileX, Zap, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class AiRepairErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: Math.random().toString(36).substr(2, 9),
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AI Repair Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external error reporting service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `AI Repair Error: ${error.message}`,
        fatal: false,
        error_id: this.state.errorId,
      });
    }
  }

  private retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: Math.random().toString(36).substr(2, 9),
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || AiRepairErrorFallback;
      return <FallbackComponent error={this.state.error!} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// Default error fallback component for AI repair functionality
interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

export const AiRepairErrorFallback = ({ error, retry }: ErrorFallbackProps) => {
  const getErrorType = (error: Error) => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (
      message.includes('rate limit') ||
      message.includes('too many requests')
    ) {
      return 'rate_limit';
    }
    if (
      message.includes('ai') ||
      message.includes('gemini') ||
      message.includes('repair')
    ) {
      return 'ai_service';
    }
    if (message.includes('parse') || message.includes('json')) {
      return 'parsing';
    }
    return 'unknown';
  };

  const errorType = getErrorType(error);

  const getErrorConfig = (type: string) => {
    switch (type) {
      case 'network':
        return {
          icon: AlertTriangle,
          title: 'Connection Problem',
          description:
            'Unable to connect to the AI repair service. Please check your internet connection.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          actionText: 'Try Again',
          showRetry: true,
        };
      case 'rate_limit':
        return {
          icon: AlertTriangle,
          title: 'Rate Limit Exceeded',
          description:
            "You've reached the maximum number of AI repair attempts. Please wait before trying again.",
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          actionText: 'Try Again Later',
          showRetry: false,
        };
      case 'ai_service':
        return {
          icon: Zap,
          title: 'AI Service Error',
          description:
            'The AI repair service encountered an issue. This is usually temporary.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          actionText: 'Retry AI Repair',
          showRetry: true,
        };
      case 'parsing':
        return {
          icon: FileX,
          title: 'Data Processing Error',
          description:
            'There was an issue processing your CSV data. The file might be corrupted or in an unsupported format.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          actionText: 'Try Different File',
          showRetry: false,
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Unexpected Error',
          description:
            'An unexpected error occurred during AI repair. Please try again or contact support.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          actionText: 'Try Again',
          showRetry: true,
        };
    }
  };

  const config = getErrorConfig(errorType);
  const Icon = config.icon;

  return (
    <Card className={`w-full max-w-2xl mx-auto ${config.borderColor}`}>
      <CardHeader className={`${config.bgColor} rounded-t-lg`}>
        <CardTitle className={`flex items-center gap-3 ${config.color}`}>
          <Icon className="h-6 w-6" />
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className={`${config.borderColor} ${config.bgColor}`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
          <AlertDescription className="space-y-3">
            <p className="font-medium">{config.description}</p>

            {/* Error details for debugging */}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Technical Details
              </summary>
              <div className="mt-2 p-2 bg-muted rounded text-muted-foreground font-mono">
                <p>
                  <strong>Error:</strong> {error.message}
                </p>
                <p>
                  <strong>Type:</strong> {errorType}
                </p>
                <p>
                  <strong>Time:</strong> {new Date().toLocaleString()}
                </p>
              </div>
            </details>
          </AlertDescription>
        </Alert>

        {/* Suggested actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">What you can do:</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {errorType === 'network' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Check your internet connection and try again</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>If the problem persists, try refreshing the page</p>
                </div>
              </>
            )}

            {errorType === 'rate_limit' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Wait a few minutes before trying AI repair again</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Consider manually editing your CSV file instead</p>
                </div>
              </>
            )}

            {errorType === 'ai_service' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Try the AI repair again in a few moments</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>If it continues failing, manually fix your CSV file</p>
                </div>
              </>
            )}

            {errorType === 'parsing' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Check that your CSV file is properly formatted</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <p>
                    Try saving your file as CSV again from your spreadsheet app
                  </p>
                </div>
              </>
            )}

            {errorType === 'unknown' && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Try refreshing the page and uploading again</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                  <p>
                    If the issue persists, contact support with the error
                    details
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>

          {config.showRetry && (
            <Button onClick={retry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              {config.actionText}
            </Button>
          )}
        </div>

        {/* Error ID for support */}
        <div className="pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            Error ID: {Math.random().toString(36).substr(2, 9)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Specific error boundaries for different AI repair components
export const AiRepairPreviewErrorBoundary = ({
  children,
}: {
  children: ReactNode;
}) => (
  <AiRepairErrorBoundary
    fallback={({ error, retry }) => (
      <AiRepairErrorFallback error={error} retry={retry} />
    )}
    onError={(error, errorInfo) => {
      console.error('AI Repair Preview Error:', { error, errorInfo });
    }}
  >
    {children}
  </AiRepairErrorBoundary>
);

export const AiRepairUploadErrorBoundary = ({
  children,
}: {
  children: ReactNode;
}) => (
  <AiRepairErrorBoundary
    fallback={({ error, retry }) => (
      <AiRepairErrorFallback error={error} retry={retry} />
    )}
    onError={(error, errorInfo) => {
      console.error('AI Repair Upload Error:', { error, errorInfo });
    }}
  >
    {children}
  </AiRepairErrorBoundary>
);

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Download,
  Zap,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  RefreshCw,
  X,
} from 'lucide-react';
// import { toast } from 'sonner';
import { useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { AiRepairPreview } from './AiRepairPreview';
import { AiRepairUploadErrorBoundary } from './AiRepairErrorBoundary';
// import {
//   RateLimitErrorState,
//   NetworkErrorState,
//   AiServiceErrorState,
//   FileProcessingErrorState,
// } from './AiRepairErrorStates';
import {
  AiRepairSuccessFeedback,
  AiRepairWarningFeedback,
  // UploadConfirmationFeedback,
} from './AiRepairFeedback';
import { aiRepairToasts } from '../utils/aiRepairToasts';
// import { useAiRepairFeedback } from '../hooks/useAiRepairFeedback';

interface StudentUploadSectionProps {
  csvData: any[];
  onCsvUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // New props for AI Fix functionality
  csvError?: string | null;
  onAiFixSuccess?: (repairedData: any[]) => void;
  onAiFixError?: (error: string) => void;
  onClearCsv?: () => void;
}

const StudentUploadSection = ({
  csvData,
  onCsvUpload,
  csvError,
  onAiFixSuccess,
  onAiFixError,
  onClearCsv,
}: StudentUploadSectionProps) => {
  const [isAiFixing, setIsAiFixing] = useState(false);
  const [aiFixResult, setAiFixResult] = useState<any>(null);
  const [rawCsvContent, setRawCsvContent] = useState<string>('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    exceeded: boolean;
    retryAfter?: number;
    message?: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const aiFixCsv = useAction(api.actions.aiFixCsv.aiFixCsv);

  // Handle file selection and store raw content for AI fix
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setRawCsvContent(content);
      };
      reader.readAsText(file);
    }

    // Call the original handler
    onCsvUpload(event);
  };

  // Handle AI Fix CSV button click
  const handleAiFixCsv = async () => {
    if (!rawCsvContent) {
      aiRepairToasts.repairFailed('No CSV content available for AI repair');
      return;
    }

    setIsAiFixing(true);
    setRateLimitInfo(null);

    // Show loading toast
    const loadingToastId = aiRepairToasts.repairStarted();

    try {
      const result = await aiFixCsv({ rawCsvText: rawCsvContent });

      // Dismiss loading toast
      aiRepairToasts.dismiss(loadingToastId);

      if (result.repaired) {
        // Success case - show preview modal
        setAiFixResult(result);
        setShowPreview(true);

        // Show success toast with detailed information
        aiRepairToasts.repairSuccess({
          studentCount: result.data.length,
          confidence: result.confidence.overall,
          correctionsMade: result.metadata.dataCorrections.length,
          processingTime: Math.round(
            (result.metadata.processingEndTime -
              result.metadata.processingStartTime) /
              1000,
          ),
        });

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          if (result.confidence.overall < 0.7) {
            aiRepairToasts.lowConfidenceWarning(
              result.confidence.overall,
              result.warnings.length,
            );
          }

          if (result.metadata.genderInferences > 0) {
            aiRepairToasts.genderInferenceWarning(
              result.metadata.genderInferences,
            );
          }

          if (result.metadata.rowsExcluded > 0) {
            aiRepairToasts.dataLossWarning(result.metadata.rowsExcluded);
          }
        }
      } else {
        // Error case
        if (result.errorType === 'rate_limit_error') {
          setRateLimitInfo({
            exceeded: true,
            retryAfter: result.retryAfter,
            message: result.error,
          });
          aiRepairToasts.rateLimitError(result.retryAfter || 300);
        } else if (result.errorType === 'network_error') {
          aiRepairToasts.networkError();
        } else if (result.errorType === 'parsing_error') {
          aiRepairToasts.fileProcessingError();
        } else {
          aiRepairToasts.repairFailed(result.error || 'Unknown error occurred');
        }

        if (onAiFixError) {
          onAiFixError(result.error || 'AI repair failed');
        }
      }
    } catch (error) {
      console.error('AI Fix CSV error:', error);
      aiRepairToasts.dismiss(loadingToastId);

      // Determine error type and show appropriate toast
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      if (
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('fetch')
      ) {
        aiRepairToasts.networkError();
      } else {
        aiRepairToasts.repairFailed(errorMessage);
      }

      if (onAiFixError) {
        onAiFixError(errorMessage);
      }
    } finally {
      setIsAiFixing(false);
    }
  };

  // Rate limit countdown
  const [countdown, setCountdown] = useState<number>(0);

  // Effect to handle countdown
  useEffect(() => {
    if (rateLimitInfo?.exceeded && rateLimitInfo.retryAfter) {
      setCountdown(rateLimitInfo.retryAfter);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setRateLimitInfo(null);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [rateLimitInfo]);

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  // Handle preview modal actions
  const handlePreviewConfirm = async () => {
    if (!aiFixResult || !onAiFixSuccess) return;

    setIsConfirming(true);
    try {
      // Call the success handler with the repaired data
      onAiFixSuccess(aiFixResult.data);

      // Show upload success toast
      aiRepairToasts.uploadSuccess(aiFixResult.data.length);

      // Close the preview modal
      setShowPreview(false);

      // Clear the AI fix result
      setAiFixResult(null);
    } catch (error) {
      console.error('Error applying repaired data:', error);
      aiRepairToasts.repairFailed('Failed to apply repaired data');
    } finally {
      setIsConfirming(false);
    }
  };

  const handlePreviewCancel = () => {
    setShowPreview(false);
    setAiFixResult(null);
    aiRepairToasts.repairCancelled();
  };

  return (
    <AiRepairUploadErrorBoundary>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Student List (Optional)</CardTitle>
          <CardDescription>
            Upload a CSV file with student information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors animate-slide-in-right">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="csv-upload">
              <div className="cursor-pointer">
                <p className="text-sm font-medium text-foreground">
                  Upload Student CSV
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  CSV should contain: name, gender, registration number
                </p>
              </div>
            </Label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Error State with AI Fix Option */}
          {csvError && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col space-y-3">
                <div>
                  <strong>CSV parsing failed:</strong> {csvError}
                </div>

                {/* AI Fix and Clear Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleAiFixCsv}
                    disabled={
                      isAiFixing || !rawCsvContent || rateLimitInfo?.exceeded
                    }
                    size="sm"
                    className={`${
                      rateLimitInfo?.exceeded
                        ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    } text-white border-0 transition-all duration-200 flex-1`}
                  >
                    {isAiFixing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        AI is fixing your CSV...
                      </>
                    ) : rateLimitInfo?.exceeded ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Rate Limited
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        AI Fix CSV
                      </>
                    )}
                  </Button>

                  {onClearCsv && (
                    <Button
                      onClick={onClearCsv}
                      variant="outline"
                      size="sm"
                      className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear CSV
                    </Button>
                  )}

                  {rateLimitInfo?.exceeded && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      Retry in {formatCountdown(countdown)}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Our AI can automatically fix common CSV issues like incorrect
                  headers, formatting problems, and missing data.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Rate Limit Warning */}
          {rateLimitInfo?.exceeded && (
            <Alert className="animate-fade-in border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="flex flex-col space-y-3">
                  <div>
                    <strong className="text-orange-800">
                      Rate limit reached:
                    </strong>{' '}
                    <span className="text-orange-700">
                      {rateLimitInfo.message}
                    </span>
                  </div>

                  {/* Visual countdown progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-800">
                        Time remaining:
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        {formatCountdown(countdown)}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                        style={{
                          width: `${Math.max(0, (((rateLimitInfo.retryAfter || 0) - countdown) / (rateLimitInfo.retryAfter || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2" />
                    <p className="text-xs text-orange-700">
                      <strong>What you can do:</strong> You can try AI repair
                      again once the cooldown period ends, or manually edit your
                      CSV file and upload it again.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <p className="text-xs text-orange-700">
                      <strong>Why rate limits exist:</strong> Rate limits help
                      ensure fair usage and maintain service quality for all
                      users.
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* AI Fix Success Feedback */}
          {aiFixResult && aiFixResult.repaired && !showPreview && (
            <div id="ai-repair-success">
              <AiRepairSuccessFeedback
                repairResult={aiFixResult}
                onDismiss={() => setAiFixResult(null)}
              />
            </div>
          )}

          {/* AI Fix Warning Feedback */}
          {aiFixResult &&
            aiFixResult.repaired &&
            aiFixResult.warnings &&
            (aiFixResult.confidence.overall < 0.7 ||
              aiFixResult.warnings.length > 0) &&
            !showPreview && (
              <div id="ai-repair-warnings">
                <AiRepairWarningFeedback
                  warnings={aiFixResult.warnings}
                  confidence={aiFixResult.confidence}
                  onReview={() => setShowPreview(true)}
                  onProceed={handlePreviewConfirm}
                  onCancel={handlePreviewCancel}
                />
              </div>
            )}

          {/* Success State - CSV Loaded */}
          {csvData.length > 0 && !csvError && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {csvData.length} students loaded successfully
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:scale-105 transition-transform"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                  {onClearCsv && (
                    <Button
                      onClick={onClearCsv}
                      variant="outline"
                      size="sm"
                      className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Students will be able to join using the course link after
                creation.
              </div>
            </div>
          )}

          {/* Loading State */}
          {isAiFixing && (
            <div className="flex items-center justify-center p-4 animate-fade-in">
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">
                  AI is analyzing and repairing your CSV...
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Repair Preview Modal */}
      {aiFixResult && aiFixResult.repaired && (
        <AiRepairPreview
          open={showPreview}
          onOpenChange={setShowPreview}
          repairResult={aiFixResult}
          onConfirm={handlePreviewConfirm}
          onCancel={handlePreviewCancel}
          isConfirming={isConfirming}
        />
      )}
    </AiRepairUploadErrorBoundary>
  );
};

export default StudentUploadSection;

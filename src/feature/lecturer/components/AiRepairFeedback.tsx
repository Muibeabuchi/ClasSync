import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Target,
  Shield,
  Brain,
  Sparkles,
  X,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Success feedback for AI repair completion
interface AiRepairSuccessFeedbackProps {
  repairResult: {
    data: Array<{
      name: string;
      gender: 'Male' | 'Female';
      regNumber: string;
    }>;
    summary: string;
    confidence: {
      overall: number;
      headerMapping: number;
      dataNormalization: number;
      genderInference: number;
      highConfidenceCount: number;
      lowConfidenceCount: number;
    };
    metadata: {
      headerMappings: Array<{
        detected: string;
        mapped: string;
        confidence: number;
      }>;
      dataCorrections: string[];
      genderInferences: number;
      rowsProcessed: number;
      rowsExcluded: number;
      processingStartTime: number;
      processingEndTime: number;
    };
  };
  onDismiss?: () => void;
}

export const AiRepairSuccessFeedback = ({
  repairResult,
  onDismiss,
}: AiRepairSuccessFeedbackProps) => {
  const processingTime = Math.round(
    (repairResult.metadata.processingEndTime -
      repairResult.metadata.processingStartTime) /
      1000,
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6)
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Excellent';
    if (confidence >= 0.8) return 'Very Good';
    if (confidence >= 0.7) return 'Good';
    if (confidence >= 0.6) return 'Fair';
    return 'Needs Review';
  };

  // Show success toast notification
  React.useEffect(() => {
    toast.success('CSV Successfully Repaired!', {
      description: `${repairResult.data.length} students processed with ${Math.round(repairResult.confidence.overall * 100)}% confidence`,
      duration: 5000,
      action: {
        label: 'View Details',
        onClick: () => {
          // Scroll to preview or open details
          const previewElement = document.getElementById('ai-repair-preview');
          if (previewElement) {
            previewElement.scrollIntoView({ behavior: 'smooth' });
          }
        },
      },
    });
  }, [repairResult]);

  return (
    <Card className="border-green-200 bg-green-50/50 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <div className="p-1 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            AI Repair Completed Successfully
          </CardTitle>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Success Message */}
        <Alert className="border-green-200 bg-green-50">
          <Sparkles className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">{repairResult.summary}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{repairResult.data.length} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{processingTime}s processing</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>
                    {Math.round(repairResult.confidence.overall * 100)}%
                    confidence
                  </span>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Confidence Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center mb-2">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-600">
              {Math.round(repairResult.confidence.overall * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Overall</div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs mt-1',
                getConfidenceColor(repairResult.confidence.overall),
              )}
            >
              {getConfidenceLabel(repairResult.confidence.overall)}
            </Badge>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-purple-600">
              {Math.round(repairResult.confidence.headerMapping * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Headers</div>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-600">
              {Math.round(repairResult.confidence.dataNormalization * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Data Quality</div>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-orange-600">
              {Math.round(repairResult.confidence.genderInference * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Inference</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {repairResult.metadata.dataCorrections.length}
            </div>
            <div className="text-muted-foreground">Corrections Made</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {repairResult.metadata.genderInferences}
            </div>
            <div className="text-muted-foreground">Gender Inferred</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">
              {repairResult.metadata.headerMappings.length}
            </div>
            <div className="text-muted-foreground">Headers Mapped</div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Next Steps
          </h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>Review the repaired data in the preview table below</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>Check any warnings or low-confidence repairs</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>
                Click &quot;Confirm & Use Repaired Data&quot; to proceed with
                upload
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Warning feedback for low confidence repairs
interface AiRepairWarningFeedbackProps {
  warnings: Array<{
    type: string;
    message: string;
    affectedCount?: number;
    details?: string[];
  }>;
  confidence: {
    overall: number;
    lowConfidenceCount: number;
    highConfidenceCount: number;
  };
  onReview?: () => void;
  onProceed?: () => void;
  onCancel?: () => void;
}

export const AiRepairWarningFeedback = ({
  warnings,
  confidence,
  onReview,
  onProceed,
  onCancel,
}: AiRepairWarningFeedbackProps) => {
  const isLowConfidence = confidence.overall < 0.7;
  const hasHighRiskWarnings = warnings.some(
    (w) => w.type === 'data_loss' || w.type === 'low_confidence',
  );

  // Show warning toast notification
  React.useEffect(() => {
    if (isLowConfidence || hasHighRiskWarnings) {
      toast.warning('Review Required', {
        description: `${warnings.length} warnings detected. Please review before proceeding.`,
        duration: 8000,
        action: {
          label: 'Review',
          onClick: onReview || (() => {}),
        },
      });
    }
  }, [warnings, isLowConfidence, hasHighRiskWarnings, onReview]);

  const getWarningIcon = (type: string) => {
    switch (type) {
      case 'gender_inference':
        return <Info className="h-4 w-4" />;
      case 'low_confidence':
        return <AlertTriangle className="h-4 w-4" />;
      case 'data_loss':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getWarningColor = (type: string) => {
    switch (type) {
      case 'data_loss':
      case 'low_confidence':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'gender_inference':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50/50 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <div className="p-1 bg-yellow-100 rounded-full">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          Review Required - {warnings.length} Warning
          {warnings.length !== 1 ? 's' : ''} Detected
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confidence Alert */}
        {isLowConfidence && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <p className="font-medium">
                  Low Confidence Repair ({Math.round(confidence.overall * 100)}
                  %)
                </p>
                <p className="text-sm">
                  The AI repair has low confidence in some changes. Please
                  review carefully before proceeding.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>
                      {confidence.highConfidenceCount} high confidence
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    <span>{confidence.lowConfidenceCount} need review</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Individual Warnings */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Warnings & Issues:</h4>
          {warnings.map((warning, index) => (
            <Alert key={index} className={getWarningColor(warning.type)}>
              {getWarningIcon(warning.type)}
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{warning.message}</p>
                    {warning.affectedCount && (
                      <Badge variant="outline" className="text-xs">
                        {warning.affectedCount} affected
                      </Badge>
                    )}
                  </div>

                  {warning.details && warning.details.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Details:</p>
                      <ul className="text-xs space-y-0.5">
                        {warning.details.slice(0, 3).map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-xs">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                        {warning.details.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            ... and {warning.details.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>

        {/* Confidence Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Confidence</span>
            <span
              className={cn(
                'font-medium',
                confidence.overall >= 0.8
                  ? 'text-green-600'
                  : confidence.overall >= 0.6
                    ? 'text-yellow-600'
                    : 'text-red-600',
              )}
            >
              {Math.round(confidence.overall * 100)}%
            </span>
          </div>
          <Progress
            value={confidence.overall * 100}
            className={cn(
              'h-2',
              confidence.overall >= 0.8
                ? '[&>div]:bg-green-500'
                : confidence.overall >= 0.6
                  ? '[&>div]:bg-yellow-500'
                  : '[&>div]:bg-red-500',
            )}
          />
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Recommendations
          </h4>
          <div className="space-y-1 text-sm text-blue-700">
            {isLowConfidence && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p>Manually review and edit the data before confirming</p>
              </div>
            )}
            {hasHighRiskWarnings && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p>Consider uploading a corrected CSV file instead</p>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>Check the preview table for highlighted changes</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel & Upload New File
            </Button>
          )}

          {onReview && (
            <Button variant="outline" onClick={onReview} className="flex-1">
              Review Details
            </Button>
          )}

          {onProceed && (
            <Button
              onClick={onProceed}
              className={cn(
                'flex-1',
                isLowConfidence || hasHighRiskWarnings
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-green-600 hover:bg-green-700',
              )}
            >
              {isLowConfidence || hasHighRiskWarnings
                ? 'Proceed Despite Warnings'
                : 'Proceed with Repair'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Upload confirmation feedback
interface UploadConfirmationFeedbackProps {
  studentCount: number;
  repairStats?: {
    correctionsMade: number;
    genderInferences: number;
    headerMappings: number;
    confidence: number;
  };
  onComplete?: () => void;
}

export const UploadConfirmationFeedback = ({
  studentCount,
  repairStats,
  onComplete,
}: UploadConfirmationFeedbackProps) => {
  // Show success toast notification
  React.useEffect(() => {
    toast.success('Upload Successful!', {
      description: `${studentCount} students added to your course`,
      duration: 4000,
    });
  }, [studentCount]);

  return (
    <Card className="border-green-200 bg-green-50/50 animate-fade-in">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Upload Completed Successfully!
            </h3>
            <p className="text-green-700">
              {studentCount} students have been added to your course
            </p>
          </div>

          {repairStats && (
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI Repair Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">
                    {repairStats.correctionsMade}
                  </div>
                  <div className="text-muted-foreground">Corrections</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">
                    {repairStats.genderInferences}
                  </div>
                  <div className="text-muted-foreground">Inferences</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">
                    {repairStats.headerMappings}
                  </div>
                  <div className="text-muted-foreground">Mappings</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">
                    {Math.round(repairStats.confidence * 100)}%
                  </div>
                  <div className="text-muted-foreground">Confidence</div>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-green-700">
            Students can now join your course using the course link.
          </div>

          {onComplete && (
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              Continue to Course Setup
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

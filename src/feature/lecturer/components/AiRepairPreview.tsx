import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  // SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Users,
  FileText,
  Clock,
  TrendingUp,
  X,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AiRepairPreviewErrorBoundary } from './AiRepairErrorBoundary';

interface AiRepairPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repairResult: {
    repaired: true;
    data: Array<{
      name: string;
      gender: 'Male' | 'Female';
      regNumber: string;
    }>;
    summary: string;
    warnings: Array<{
      type: string;
      message: string;
      affectedCount?: number;
      details?: string[];
    }>;
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
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

export const AiRepairPreview = ({
  open,
  onOpenChange,
  repairResult,
  onConfirm,
  onCancel,
  isConfirming = false,
}: AiRepairPreviewProps) => {
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);
  const [highlightChanges, setHighlightChanges] = useState(true);

  const processingTime = Math.round(
    (repairResult.metadata.processingEndTime -
      repairResult.metadata.processingStartTime) /
      1000,
  );

  // Determine which cells were likely modified based on metadata
  const getModifiedCells = (student: any) => {
    const modifications = {
      name: false,
      gender: false,
      regNumber: false,
    };

    // Check if this student had gender inferred
    const genderInferencePattern = new RegExp(
      `inferred gender.*${student.name}|${student.name}.*inferred gender`,
      'i',
    );
    const hasGenderInference = repairResult.metadata.dataCorrections.some(
      (correction) => genderInferencePattern.test(correction),
    );

    // Check for name corrections (capitalization, etc.)
    const nameCorrections = repairResult.metadata.dataCorrections.filter(
      (correction) =>
        correction.toLowerCase().includes('name') ||
        correction.toLowerCase().includes('capitali'),
    );

    modifications.gender = hasGenderInference;
    modifications.name = nameCorrections.length > 0;

    return modifications;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6)
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

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

  const content = (
    <AiRepairPreviewErrorBoundary>
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">AI Repair Complete</h3>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'px-3 py-1',
                getConfidenceColor(repairResult.confidence.overall),
              )}
            >
              {Math.round(repairResult.confidence.overall * 100)}% Confidence
            </Badge>
          </div>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {repairResult.summary}
            </AlertDescription>
          </Alert>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">
                {repairResult.data.length}
              </div>
              <div className="text-xs text-muted-foreground">Students</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">
                {repairResult.metadata.dataCorrections.length}
              </div>
              <div className="text-xs text-muted-foreground">Corrections</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">
                {repairResult.metadata.genderInferences}
              </div>
              <div className="text-xs text-muted-foreground">Inferences</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{processingTime}s</div>
              <div className="text-xs text-muted-foreground">Processing</div>
            </CardContent>
          </Card>
        </div>

        {/* Warnings */}
        {repairResult.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Warnings & Notes
            </h4>
            {repairResult.warnings.map((warning, index) => (
              <Alert
                key={index}
                variant="default"
                className="border-yellow-200 bg-yellow-50"
              >
                {getWarningIcon(warning.type)}
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium text-yellow-800">
                      {warning.message}
                    </p>
                    {warning.details && warning.details.length > 0 && (
                      <ul className="text-sm text-yellow-700 list-disc list-inside">
                        {warning.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Preview Controls */}
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Preview Repaired Data</h4>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHighlightChanges(!highlightChanges)}
              className="flex items-center gap-2"
            >
              {highlightChanges ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Changes
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </div>

        {/* Data Preview Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Registration Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repairResult.data.map((student, index) => {
                    const modifications = getModifiedCells(student);

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell
                          className={cn(
                            highlightChanges &&
                              modifications.name &&
                              'bg-blue-50 border-l-2 border-l-blue-400 font-medium',
                          )}
                        >
                          {student.name}
                          {highlightChanges && modifications.name && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Fixed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            highlightChanges &&
                              modifications.gender &&
                              'bg-purple-50 border-l-2 border-l-purple-400 font-medium',
                          )}
                        >
                          {student.gender}
                          {highlightChanges && modifications.gender && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Inferred
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            highlightChanges &&
                              modifications.regNumber &&
                              'bg-green-50 border-l-2 border-l-green-400 font-medium',
                          )}
                        >
                          {student.regNumber}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        {showDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Repair Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Header Mappings */}
              {repairResult.metadata.headerMappings.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Header Mappings</h5>
                  <div className="space-y-1">
                    {repairResult.metadata.headerMappings.map(
                      (mapping, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm bg-muted p-2 rounded"
                        >
                          <span>
                            &quot;{mapping.detected}&quot; → &quot;
                            {mapping.mapped}
                            &quot;
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(mapping.confidence * 100)}%
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Data Corrections */}
              {repairResult.metadata.dataCorrections.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Data Corrections Applied</h5>
                  <ScrollArea className="h-32">
                    <ul className="space-y-1 text-sm">
                      {repairResult.metadata.dataCorrections.map(
                        (correction, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{correction}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              <Separator />

              {/* Confidence Breakdown */}
              <div>
                <h5 className="font-medium mb-2">Confidence Breakdown</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Header Mapping:</span>
                      <Badge
                        variant="outline"
                        className={getConfidenceColor(
                          repairResult.confidence.headerMapping,
                        )}
                      >
                        {Math.round(
                          repairResult.confidence.headerMapping * 100,
                        )}
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Normalization:</span>
                      <Badge
                        variant="outline"
                        className={getConfidenceColor(
                          repairResult.confidence.dataNormalization,
                        )}
                      >
                        {Math.round(
                          repairResult.confidence.dataNormalization * 100,
                        )}
                        %
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Gender Inference:</span>
                      <Badge
                        variant="outline"
                        className={getConfidenceColor(
                          repairResult.confidence.genderInference,
                        )}
                      >
                        {Math.round(
                          repairResult.confidence.genderInference * 100,
                        )}
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>High Confidence:</span>
                      <Badge variant="outline">
                        {repairResult.confidence.highConfidenceCount} records
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel & Try Again
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isConfirming ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Confirming...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirm & Use Repaired Data
              </>
            )}
          </Button>
        </div>
      </div>
    </AiRepairPreviewErrorBoundary>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              AI Repair Preview
            </SheetTitle>
            <SheetDescription>
              Review the AI-repaired CSV data before confirming
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            AI Repair Preview
          </DialogTitle>
          <DialogDescription>
            Review the AI-repaired CSV data before confirming
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Camera,
  AlertTriangle,
  Check,
  X,
  User,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageCropper } from './image-cropper';
import { faceDetectionValidator } from '@/utils/faceDetectionValidation';
import type { FaceValidationResult } from '@/utils/faceDetectionValidation';

interface CourseImageUploadProps {
  onImageSelected: (file: File) => void;
  onImageRemoved: () => void;
  selectedImage?: File | null;
  isUploading?: boolean;
  error?: string;
  className?: string;
}

export const CourseImageUpload: React.FC<CourseImageUploadProps> = ({
  onImageSelected,
  onImageRemoved,
  selectedImage,
  isUploading = false,
  error,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [validationResult, setValidationResult] =
    useState<FaceValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    // Basic file validation
    if (!file.type.startsWith('image/')) {
      setValidationResult({
        isValid: false,
        error: 'Please select a valid image file.',
      });
      return;
    }

    // File size validation (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setValidationResult({
        isValid: false,
        error:
          'Image file is too large. Please select an image smaller than 5MB.',
      });
      return;
    }

    // Create temporary URL for cropper
    const imageUrl = URL.createObjectURL(file);
    setTempImageUrl(imageUrl);
    setShowCropper(true);
    setValidationResult(null);
  };

  const handleCropComplete = async (croppedFile: File) => {
    setShowCropper(false);
    setIsValidating(true);

    try {
      // Final validation of cropped image
      const result =
        await faceDetectionValidator.validateImageFile(croppedFile);
      setValidationResult(result);

      if (result.isValid) {
        onImageSelected(croppedFile);
      }
    } catch (error) {
      console.error('Final validation error:', error);
      setValidationResult({
        isValid: false,
        error: 'Failed to validate the cropped image. Please try again.',
      });
    } finally {
      setIsValidating(false);
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
  };

  const handleRemoveImage = () => {
    onImageRemoved();
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Show cropper modal
  if (showCropper && tempImageUrl) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Crop Your Image</h3>
            <ImageCropper
              image={tempImageUrl}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Important Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Important:</strong> Upload a clear photo of yourself. This
          image will be used by your lecturer to identify you during attendance
          and request review. Make sure your face is clearly visible and
          well-lit.
        </AlertDescription>
      </Alert>

      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors',
          dragActive && 'border-primary bg-primary/5',
          selectedImage &&
            validationResult?.isValid &&
            'border-green-500 bg-green-50',
          (error || (validationResult && !validationResult.isValid)) &&
            'border-destructive bg-destructive/5',
        )}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Student Identification Photo
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedImage ? (
            <Button
              className={cn(
                'border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors cursor-pointer hover:border-primary/50',
                dragActive && 'border-primary bg-primary/5',
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
              asChild
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Upload your photo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag and drop or click to select
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button type="button" variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG • Max 5MB • Must contain exactly one face
                </p>
              </div>
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedImage.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Validation Status */}
              {isValidating && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Validating image...
                  </span>
                </div>
              )}

              {validationResult && !isValidating && (
                <div className="space-y-2">
                  <Badge
                    variant={
                      validationResult.isValid ? 'default' : 'destructive'
                    }
                    className="w-full justify-center"
                  >
                    {validationResult.isValid ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Valid - Ready to submit
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Invalid image
                      </>
                    )}
                  </Badge>
                  {validationResult.error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {validationResult.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          )}

          {/* General Error */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-2">Photo Requirements:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Must contain exactly one face (yours)</li>
            <li>• Face should be clearly visible and well-lit</li>
            <li>• No sunglasses, hats, or face coverings</li>
            <li>• Image will be cropped to focus on your face</li>
            <li>• This photo is specific to this course only</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

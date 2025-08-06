import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
  },
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        // Handle rejected files - could show toast notification
        console.warn('Some files were rejected:', rejectedFiles);
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onChange(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      }
    },
    [onChange],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    isFocused,
  } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
    disabled,
    multiple: false,
  });

  const removeImage = useCallback(() => {
    onChange(null);
    setPreview(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  }, [onChange, preview]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const getBorderColor = () => {
    if (isDragReject) return 'border-destructive';
    if (isDragAccept) return 'border-green-500';
    if (isFocused) return 'border-primary';
    return 'border-border';
  };

  const getBackgroundColor = () => {
    if (isDragActive) {
      return isDragAccept
        ? 'bg-green-50 dark:bg-green-950/20'
        : 'bg-destructive/10';
    }
    return 'bg-background';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview Section */}
      {(preview || value) && (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
            <img
              src={preview || (value ? URL.createObjectURL(value) : '')}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={removeImage}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Dropzone */}
      {!preview && !value && (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
            getBorderColor(),
            getBackgroundColor(),
            disabled && 'cursor-not-allowed opacity-50',
            'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div
              className={cn(
                'p-4 rounded-full transition-colors',
                isDragActive
                  ? isDragAccept
                    ? 'bg-green-100 dark:bg-green-900/20'
                    : 'bg-destructive/20'
                  : 'bg-muted',
              )}
            >
              {isDragActive ? (
                <Upload
                  className={cn(
                    'h-8 w-8',
                    isDragAccept ? 'text-green-600' : 'text-destructive',
                  )}
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              {isDragActive ? (
                <p
                  className={cn(
                    'text-sm font-medium',
                    isDragAccept ? 'text-green-600' : 'text-destructive',
                  )}
                >
                  {isDragAccept
                    ? 'Drop the image here'
                    : 'File type not supported'}
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Drag & drop an image here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to select from your device
                  </p>
                </>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Supported formats: JPEG, PNG, GIF, WebP</p>
              <p>Maximum size: {Math.round(maxSize / (1024 * 1024))}MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

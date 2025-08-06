import React, { useRef, useState } from 'react';
import { Camera, Trash2, Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useImageUpload, useUserProfileImage } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDeleteButton?: boolean;
  onImageChange?: (imageUrl: string | null) => void;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  className,
  size = 'md',
  showDeleteButton = true,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { uploadImage, deleteImage, isUploading, isDeleting } =
    useImageUpload();
  const { imageUrl, isLoading } = useUserProfileImage();

  const handleFileSelect = (file: File) => {
    uploadImage(file, {
      onSuccess: (data) => {
        onImageChange?.(data.imageUrl || null);
      },
    });
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    deleteImage();
    onImageChange?.(null);
  };

  const isProcessing = isUploading || isDeleting;

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      {/* Avatar with upload area */}
      <div
        className={cn(
          'relative group cursor-pointer rounded-full border-2 border-dashed border-muted-foreground/25 transition-colors',
          sizeClasses[size],
          dragOver && 'border-primary bg-primary/5',
          isProcessing && 'opacity-50 cursor-not-allowed',
        )}
        role="button"
        tabIndex={isProcessing ? -1 : 0}
        aria-label={imageUrl ? 'Change profile image' : 'Upload profile image'}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!isProcessing ? handleUploadClick : undefined}
        onKeyDown={(event) => {
          if (!isProcessing && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            handleUploadClick();
          }
        }}
      >
        <Avatar
          className={cn(
            'h-full w-full',
            imageUrl && 'border-2 border-background',
          )}
        >
          <AvatarImage
            src={imageUrl || undefined}
            alt="Profile"
            className="object-cover"
          />
          <AvatarFallback className="bg-muted">
            {isLoading || isProcessing ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </AvatarFallback>
        </Avatar>

        {/* Overlay on hover */}
        {!isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {imageUrl ? 'Change' : 'Upload'}
        </Button>

        {imageUrl && showDeleteButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isProcessing}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Upload instructions */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        {dragOver
          ? 'Drop image here'
          : 'Click to upload or drag and drop. Max size: 5MB'}
      </p>
    </div>
  );
};

export default ImageUpload;

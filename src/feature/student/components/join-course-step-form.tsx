import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ImageCropper } from '@/components/ui/image-cropper';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Send,
  Loader2,
  User,
  Key,
  Camera,
  CheckCircle,
  AlertTriangle,
  Upload,
  X,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from 'convex/_generated/api';
import { useRequestToJoinCourseClassList } from '@/feature/joinRequest/api';
import { useQuery } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useGetCurrentUser } from '@/feature/student/api/student-profile';
import { cn } from '@/lib/utils';

interface JoinCourseStepFormProps {
  onSuccess?: () => void;
  isMobile: boolean;
}

type Step = 'search' | 'identification' | 'photo' | 'review';

export const JoinCourseStepForm = ({
  onSuccess,
  isMobile,
}: JoinCourseStepFormProps) => {
  // Form state
  const [currentStep, setCurrentStep] = useState<Step>('search');
  const [courseCode, setCourseCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');
  const [editableRegNumber, setEditableRegNumber] = useState('');
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  // API hooks
  const { data: currentUser } = useGetCurrentUser();
  const { data: searchResult, isLoading: isSearching } = useQuery({
    ...convexQuery(api.courses.searchCourse, { courseCode: searchQuery }),
    enabled: !!searchQuery,
  });
  const { mutateAsync: requestToJoin, isPending: isJoining } =
    useRequestToJoinCourseClassList();
  const generateUploadUrl = useConvexMutation(api.fileUpload.generateUploadUrl);

  // Initialize registration number
  useEffect(() => {
    if (currentUser?.registrationNumber) {
      setEditableRegNumber(currentUser.registrationNumber);
    } else {
      setEditableRegNumber('');
    }
  }, [currentUser]);

  // Step configuration
  const steps: { key: Step; title: string; description: string }[] = [
    {
      key: 'search',
      title: 'Find Course',
      description: 'Enter your course code',
    },
    {
      key: 'identification',
      title: 'Identification',
      description: 'Provide your details',
    },
    {
      key: 'photo',
      title: 'Upload Photo',
      description: 'Take or upload your photo',
    },
    {
      key: 'review',
      title: 'Review & Submit',
      description: 'Confirm your request',
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const hasRegistrationNumber = Boolean(currentUser?.registrationNumber);

  // Validation functions
  const canProceedFromIdentification = hasRegistrationNumber
    ? editableRegNumber.trim().length > 0
    : uniqueCode.trim().length > 0;
  const canProceedFromPhoto = courseImage !== null;
  const canSubmitRequest = canProceedFromPhoto;

  // Handle course search
  const handleSearch = useCallback(() => {
    if (!courseCode.trim()) {
      toast.error('Please enter a course code');
      return;
    }
    setSearchQuery(courseCode.trim());
  }, [courseCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For cropping, we need to set up the temp image URL first
      const tempUrl = URL.createObjectURL(file);
      setTempImageUrl(tempUrl);
      setShowCropper(true);
    }
  };

  // Handle crop complete
  const handleCropComplete = async (croppedFile: File) => {
    setShowCropper(false);

    // Clean up temp URL
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }

    // Set the cropped image
    setCourseImage(croppedFile);
    const previewUrl = URL.createObjectURL(croppedFile);
    setImagePreviewUrl(previewUrl);

    toast.success('Photo cropped successfully!');
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropper(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setCourseImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  // Handle form submission
  const handleSubmitRequest = async () => {
    if (!searchResult || !canSubmitRequest || isJoining) return;

    let uploadingToast: string | number | undefined;

    try {
      // Show uploading toast
      uploadingToast = toast.loading('Uploading your photo...');

      // Upload image
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': courseImage!.type },
        body: courseImage,
      });

      if (!result.ok) {
        throw new Error('Failed to upload image');
      }

      const { storageId } = await result.json();

      // Update toast to show request sending
      toast.loading('Sending join request...', { id: uploadingToast });

      // Submit join request
      await requestToJoin({
        courseId: searchResult._id,
        lecturerId: searchResult.lecturer.id,
        message: '',
        uniqueCode: hasRegistrationNumber ? editableRegNumber : uniqueCode,
        courseSpecificImageId: storageId,
      });

      // Dismiss loading toast and show success
      toast.dismiss(uploadingToast);
      toast.success(
        `Your request to join ${searchResult.courseName} has been sent to ${searchResult.lecturer.name}.`,
      );

      // Reset form
      setCourseCode('');
      setSearchQuery('');
      setUniqueCode('');
      setCourseImage(null);
      setCurrentStep('search');
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Join request error:', error);

      // Ensure loading toast is dismissed on error
      if (uploadingToast) {
        toast.dismiss(uploadingToast);
      }

      // Show error toast
      toast.error('Failed to send join request. Please try again.');
    }
  };

  // Navigation functions
  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              {steps[currentStepIndex].title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {steps[currentStepIndex].description}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {currentStepIndex + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Course Search */}
        {currentStep === 'search' && (
          <Card
            className={cn(
              'transition-all duration-300',
              isMobile && 'border-0 shadow-none',
            )}
          >
            <CardHeader className={cn(isMobile && 'px-0')}>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4" />
                Find Your Course
              </CardTitle>
            </CardHeader>
            <CardContent className={cn('space-y-4', isMobile && 'px-0')}>
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="courseCode"
                      placeholder="Enter course code (e.g., CSC301)"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      disabled={isSearching}
                      className={cn(
                        'transition-all duration-200',
                        isMobile && 'h-12 text-base',
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={!courseCode.trim() || isSearching}
                      className={cn(isMobile && 'h-12 px-4')}
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Search Results */}
              {isSearching && searchQuery && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Searching...
                  </span>
                </div>
              )}

              {searchResult && !isSearching && (
                <div className="space-y-4">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">
                          {searchResult.courseName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {searchResult.courseCode}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            Lecturer:{' '}
                          </span>
                          <span className="font-medium">
                            {searchResult.lecturer.name}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {searchResult.isMember ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        You are already a member of this course.
                      </AlertDescription>
                    </Alert>
                  ) : searchResult.hasPendingRequest ? (
                    <Alert variant="default">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        You have a pending request to join this course. Please
                        wait for the lecturer to review your request.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Button
                      onClick={goToNextStep}
                      className={cn('w-full', isMobile && 'h-12')}
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}

              {searchQuery && !searchResult && !isSearching && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No course found with code &quot;{searchQuery}&quot;. Please
                    check the code and try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Student Identification */}
        {currentStep === 'identification' && (
          <Card
            className={cn(
              'transition-all duration-300',
              isMobile && 'border-0 shadow-none',
            )}
          >
            <CardHeader className={cn(isMobile && 'px-0')}>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Student Identification
              </CardTitle>
            </CardHeader>
            <CardContent className={cn('space-y-4', isMobile && 'px-0')}>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Help your lecturer identify you from their class list.
                </AlertDescription>
              </Alert>

              {hasRegistrationNumber ? (
                <div className="space-y-2">
                  <Label htmlFor="regNumber">
                    Registration Number{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="regNumber"
                    placeholder="Enter your registration number"
                    value={editableRegNumber}
                    onChange={(e) => setEditableRegNumber(e.target.value)}
                    className={cn(
                      'transition-all duration-200',
                      isMobile && 'h-12 text-base',
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can edit your registration number before sending the
                    request
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label
                    htmlFor="uniqueCode"
                    className="flex items-center gap-2"
                  >
                    <Key className="h-3 w-3" />
                    Unique Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="uniqueCode"
                    placeholder="Enter the unique code from your lecturer"
                    value={uniqueCode}
                    onChange={(e) => setUniqueCode(e.target.value)}
                    className={cn(
                      'transition-all duration-200',
                      isMobile && 'h-12 text-base',
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Since you don&apos;t have a registration number in your
                    profile, please enter the unique code your lecturer provided
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  className={cn('flex-1', isMobile && 'h-12')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceedFromIdentification}
                  className={cn('flex-1', isMobile && 'h-12')}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Photo Upload */}
        {currentStep === 'photo' && (
          <Card
            className={cn(
              'transition-all duration-300',
              isMobile && 'border-0 shadow-none',
            )}
          >
            <CardHeader className={cn(isMobile && 'px-0')}>
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="h-4 w-4" />
                Upload Your Photo
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className={cn('space-y-4', isMobile && 'px-0')}>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Upload a clear photo of yourself. You&apos;ll be able to crop
                  and adjust it before submitting.
                </AlertDescription>
              </Alert>

              {!courseImage ? (
                <div className="space-y-4">
                  <div
                    className={cn(
                      'border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                      isMobile && 'p-12',
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      document.getElementById('photo-input')?.click()
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('photo-input')?.click();
                      }
                    }}
                    aria-label="Upload photo"
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Upload your photo</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tap to select from your device
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Choose Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Supports JPG, PNG • Max 5MB
                      </p>
                    </div>
                  </div>
                  <input
                    id="photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview with Actual Image */}
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={imagePreviewUrl || ''}
                        alt="Selected "
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {courseImage.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(courseImage.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCropper(true)}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Crop & Adjust
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  className={cn('flex-1', isMobile && 'h-12')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceedFromPhoto}
                  className={cn('flex-1', isMobile && 'h-12')}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 'review' && searchResult && (
          <Card
            className={cn(
              'transition-all duration-300',
              isMobile && 'border-0 shadow-none',
            )}
          >
            <CardHeader className={cn(isMobile && 'px-0')}>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4" />
                Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent className={cn('space-y-4', isMobile && 'px-0')}>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Please review your information before sending the join
                  request.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* Course Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Course
                  </h4>
                  <p className="font-medium">{searchResult.courseName}</p>
                  <p className="text-sm text-muted-foreground">
                    {searchResult.courseCode}
                  </p>
                  <p className="text-sm">
                    Lecturer: {searchResult.lecturer.name}
                  </p>
                </div>

                {/* Student Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Your Information
                  </h4>
                  <p className="text-sm">
                    <span className="font-medium">
                      {hasRegistrationNumber
                        ? 'Registration Number'
                        : 'Unique Code'}
                      :
                    </span>{' '}
                    {hasRegistrationNumber ? editableRegNumber : uniqueCode}
                  </p>
                </div>

                {/* Photo Preview */}
                {courseImage && imagePreviewUrl && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      Your Photo
                    </h4>
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={imagePreviewUrl}
                          alt="Uploaded"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {courseImage.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(courseImage.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={isJoining}
                  className={cn('flex-1', isMobile && 'h-12')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  disabled={!canSubmitRequest || isJoining}
                  className={cn('flex-1', isMobile && 'h-12')}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Cropper Modal */}
      {showCropper && tempImageUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Crop Your Photo</h3>
              <ImageCropper
                image={tempImageUrl}
                onCropComplete={handleCropComplete}
                onCancel={handleCropCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

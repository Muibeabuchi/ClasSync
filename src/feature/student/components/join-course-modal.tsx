import { useState, useEffect } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ImageCropper } from '@/components/ui/image-cropper';
import { Search, Send, Loader2, User, Key, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from 'convex/_generated/api';
import { useRequestToJoinCourseClassList } from '@/feature/joinRequest/api';
import { useQuery } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useGetCurrentUser } from '@/feature/student/api/student-profile';
import {
  useGetPendingRequestForCourse,
  useCancelJoinRequest,
} from '@/feature/student/api/join-requests';
import { faceDetectionValidator } from '@/utils/faceDetectionValidation';
import type { FaceValidationResult } from '@/utils/faceDetectionValidation';

interface JoinCourseModalProps {
  onSuccess?: () => void;
}

const JoinCourseModal = ({ onSuccess }: JoinCourseModalProps) => {
  const [courseCode, setCourseCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestMessage] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');
  const [editableRegNumber, setEditableRegNumber] = useState('');
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [validationResult, setValidationResult] =
    useState<FaceValidationResult | null>(null);
  const [isValidatingImage, setIsValidatingImage] = useState(false);

  const { data: currentUser } = useGetCurrentUser();
  const { data: searchResult, isLoading: isSearching } = useQuery({
    ...convexQuery(api.courses.searchCourse, { courseCode: searchQuery }),
    enabled: !!searchQuery, // Only run query when searchQuery is set
  });

  const { mutateAsync: requestToJoin, isPending: isJoining } =
    useRequestToJoinCourseClassList();
  const generateUploadUrl = useConvexMutation(api.fileUpload.generateUploadUrl);

  // Get pending request details and cancel functionality
  const pendingRequest = useGetPendingRequestForCourse(searchResult?._id || '');
  const { mutateAsync: cancelRequest, isPending: isCancelling } =
    useCancelJoinRequest();

  // Initialize editable registration number when user data loads
  useEffect(() => {
    if (currentUser?.registrationNumber) {
      setEditableRegNumber(currentUser.registrationNumber);
    } else {
      setEditableRegNumber(''); // Clear if no registration number
    }
  }, [currentUser]);

  const hasRegistrationNumber = Boolean(currentUser?.registrationNumber);
  const canSubmitRequest =
    searchResult &&
    !searchResult.isMember &&
    !searchResult.hasPendingRequest &&
    ((hasRegistrationNumber && editableRegNumber.trim().length > 0) ||
      (!hasRegistrationNumber && uniqueCode.trim().length > 0)) &&
    courseImage !== null; // Image is now mandatory

  const handleSearch = () => {
    if (!courseCode.trim()) {
      toast.error('Please enter a course code');
      return;
    }
    setSearchQuery(courseCode.trim());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    if (searchResult.isMember) return;
    if (!canSubmitRequest) {
      if (!courseImage) {
        setImageUploadError(
          'Please upload your photo before sending the request.',
        );
        return;
      }
      toast.error(
        'Please provide a unique code or complete your profile with a registration number',
      );
      return;
    }

    try {
      // Show uploading toast
      const uploadingToast = toast.loading('Uploading your photo...');

      // First, generate upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload the file to Convex storage
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

      // Now create the join request with the uploaded image
      await requestToJoin({
        courseId: searchResult._id,
        lecturerId: searchResult.lecturer.id,
        message: requestMessage,
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
      setImageUploadError('');
      setValidationResult(null);
      // Reset editable registration number to original value
      if (currentUser?.registrationNumber) {
        setEditableRegNumber(currentUser.registrationNumber);
      } else {
        setEditableRegNumber('');
      }

      // Call success callback to close modal
      onSuccess?.();
    } catch (error) {
      console.error('Join request error:', error);
      toast.error('Failed to send join request. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter course code provided by your lecturer"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="pl-10"
              disabled={isSearching || isJoining}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={!courseCode.trim() || isSearching || isJoining}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
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
          <Card className="transition-all hover:shadow-md border-opacity-50">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-medium">
                    {searchResult.courseName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {searchResult.courseCode}
                  </CardDescription>
                </div>
                {searchResult.isMember && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Already Joined
                  </Badge>
                )}
                {searchResult.hasPendingRequest && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Request Pending
                  </Badge>
                )}
              </div>
              <div className="mt-2 text-sm">
                <span className="opacity-75">Lecturer: </span>
                <span className="font-medium">
                  {searchResult.lecturer.name}
                </span>
              </div>
            </CardHeader>
          </Card>

          {/* Pending Request Message */}
          {searchResult.hasPendingRequest && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 text-yellow-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Request Already Sent
                </CardTitle>
                <CardDescription className="text-yellow-700 space-y-2">
                  <p>
                    You have already sent a join request for this course. Please
                    wait for your lecturer to review and approve your request.
                  </p>
                  <p className="text-sm">
                    <strong>What happens next:</strong>
                  </p>
                  <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                    <li>Your lecturer will review your request and photo</li>
                    <li>You'll be notified once they approve or reject it</li>
                    <li>
                      If approved, you&apos;ll be automatically enrolled in the
                      course
                    </li>
                  </ul>
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-yellow-800">
                      Status: Pending Review
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                    disabled={isCancelling}
                    onClick={async () => {
                      if (!pendingRequest) {
                        toast.error('No pending request found');
                        return;
                      }

                      try {
                        await cancelRequest({ requestId: pendingRequest._id });
                        // Reset search to refresh the UI
                        setSearchQuery('');
                        setCourseCode('');
                        toast.success('Your join request has been cancelled');
                      } catch (error) {
                        console.error('Cancel request error:', error);
                        toast.error(
                          'Failed to cancel request. Please try again.',
                        );
                      }
                    }}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Request'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Student Identification Section */}
          {!searchResult.isMember && !searchResult.hasPendingRequest && (
            <Card className="border-dashed">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student Identification
                </CardTitle>
                <CardDescription>
                  Help your lecturer identify you from their class list
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6 space-y-4">
                {hasRegistrationNumber ? (
                  <div className="space-y-2">
                    <Label htmlFor="regNumber" className="text-sm font-medium">
                      Registration Number{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="regNumber"
                      placeholder="Enter your registration number"
                      value={editableRegNumber}
                      onChange={(e) => setEditableRegNumber(e.target.value)}
                      disabled={isJoining}
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
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Key className="h-3 w-3" />
                      Unique Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="uniqueCode"
                      placeholder="Enter the unique code provided by your lecturer"
                      value={uniqueCode}
                      onChange={(e) => setUniqueCode(e.target.value)}
                      disabled={isJoining}
                    />
                    <p className="text-xs text-muted-foreground">
                      Since you don&apos;t have a registration number in your
                      profile, please enter the unique code your lecturer
                      provided
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Course-Specific Image Upload with Preview */}
          {!searchResult.isMember && !searchResult.hasPendingRequest && (
            <Card className="border-dashed">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student Identification Photo
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Upload a clear photo of yourself for identification
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6 space-y-4">
                {!courseImage ? (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-primary/50"
                    onClick={() =>
                      document.getElementById('course-photo-input')?.click()
                    }
                  >
                    <div className="space-y-3">
                      <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Camera className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Upload your photo</p>
                        <p className="text-xs text-muted-foreground">
                          Click to select from your device
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG • Max 5MB • Must contain exactly one face
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(courseImage)}
                        alt="Selected photo"
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCourseImage(null)}
                        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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

                <input
                  id="course-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCourseImage(file);
                      setImageUploadError('');
                    }
                  }}
                  className="hidden"
                />

                {imageUploadError && (
                  <p className="text-sm text-destructive">{imageUploadError}</p>
                )}
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            className="w-full"
            variant="default"
            disabled={
              searchResult.isMember ||
              searchResult.hasPendingRequest ||
              isJoining ||
              !canSubmitRequest
            }
            onClick={handleSendRequest}
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {searchResult.isMember
                  ? 'Already Joined'
                  : searchResult.hasPendingRequest
                    ? 'Request Pending'
                    : 'Request to Join'}
              </>
            )}
          </Button>
        </div>
      )}

      {searchQuery && !searchResult && !isSearching && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {`No course found with code "${searchQuery}" `}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Make sure you have the correct course code from your lecturer
          </p>
        </div>
      )}
    </div>
  );
};

export default JoinCourseModal;

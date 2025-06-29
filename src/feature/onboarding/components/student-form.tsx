// components/onboarding/StudentForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useRouter } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Upload, X } from 'lucide-react';
import {
  studentFormSchema,
  StudentFormData,
  GenderType,
} from '../schema/onboarding-schema';
import {
  getFaculties,
  getDepartmentsByFaculty,
} from '@/constants/faculty-department';
import { CancelModal } from './cancel-modal';

// const genders = ['Male', 'Female'] as const;
// export type GenderType = typeof genders[number]
const yearLevels = ['100', '200', '300', '400', '500', '600'];

export const StudentForm: React.FC = () => {
  //   const navigate = useNavigate();
  //   const [showCancelModal, setShowCancelModal] = useState(false);
  //   const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  //   const router = useRouter()
  const [departments, setDepartments] = useState<string[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    mode: 'onChange',
  });

  const watchedFaculty = watch('faculty');
  const watchedDepartment = watch('department');

  useEffect(() => {
    if (watchedFaculty) {
      const depts = getDepartmentsByFaculty(watchedFaculty);
      setDepartments(depts);
      // Reset department when faculty changes
      if (!depts.includes(watchedDepartment)) {
        setValue('department', '');
      }
    }
  }, [watchedFaculty, watchedDepartment, setValue]);

  const faculties = getFaculties();

  const handleConfirmCancel = () => {
    // Mock account deletion
    // console.log('Account deleted');
    // Mock logout
    // console.log('User logged out');
    // Redirect to home
    // navigate('/');
  };

  const handleGoToDashboard = () => {
    // navigate('/dashboard');
  };

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      //   await mockSubmitStudentOnboarding(data)
      //   router.push("/dashboard")
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  //   return (

  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
  //       <div className="container mx-auto max-w-2xl">
  //         {/* Header */}
  //         <div className="text-center mb-8">
  //           <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
  //             Student Registration
  //           </h1>
  //           <p className="text-gray-600 dark:text-gray-400">
  //             Complete your profile to get started with ClassSync
  //           </p>
  //         </div>

  //         <Card>
  //           <CardHeader>
  //             <CardTitle>Personal & Academic Information</CardTitle>
  //             <CardDescription>
  //               Fill in your details to complete your student profile
  //             </CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <Form {...form}>
  //               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
  //                 {/* Personal Information */}
  //                 <div className="space-y-4">
  //                   <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
  //                     Personal Information
  //                   </h3>

  //                   <FormField
  //                     control={form.control}
  //                     name="fullName"
  //                     render={({ field }) => (
  //                       <FormItem>
  //                         <FormLabel>Full Name</FormLabel>
  //                         <FormControl>
  //                           <Input placeholder="Enter your full name" {...field} />
  //                         </FormControl>
  //                         <FormMessage />
  //                       </FormItem>
  //                     )}
  //                   />

  //                   <FormField
  //                     control={form.control}
  //                     name="registrationNumber"
  //                     render={({ field }) => (
  //                       <FormItem>
  //                         <FormLabel>Registration Number</FormLabel>
  //                         <FormControl>
  //                           <Input placeholder="e.g. 2021123456" {...field} />
  //                         </FormControl>
  //                         <FormDescription>
  //                           Registration number must start with 202 and be 10 digits
  //                         </FormDescription>
  //                         <FormMessage />
  //                       </FormItem>
  //                     )}
  //                   />

  //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //                     <FormField
  //                       control={form.control}
  //                       name="gender"
  //                       render={({ field }) => (
  //                         <FormItem>
  //                           <FormLabel>Gender</FormLabel>
  //                           <Select onValueChange={field.onChange} defaultValue={field.value}>
  //                             <FormControl>
  //                               <SelectTrigger>
  //                                 <SelectValue placeholder="Select gender" />
  //                               </SelectTrigger>
  //                             </FormControl>
  //                             <SelectContent>
  //                               {genders.map((gender) => (
  //                                 <SelectItem key={gender} value={gender}>
  //                                   {gender}
  //                                 </SelectItem>
  //                               ))}
  //                             </SelectContent>
  //                           </Select>
  //                           <FormMessage />
  //                         </FormItem>
  //                       )}
  //                     />

  //                     <FormField
  //                       control={form.control}
  //                       name="yearLevel"
  //                       render={({ field }) => (
  //                         <FormItem>
  //                           <FormLabel>Year Level</FormLabel>
  //                           <Select onValueChange={field.onChange} defaultValue={field.value}>
  //                             <FormControl>
  //                               <SelectTrigger>
  //                                 <SelectValue placeholder="Select year" />
  //                               </SelectTrigger>
  //                             </FormControl>
  //                             <SelectContent>
  //                               {yearLevels.map((year) => (
  //                                 <SelectItem key={year} value={year}>
  //                                   {year} Level
  //                                 </SelectItem>
  //                               ))}
  //                             </SelectContent>
  //                           </Select>
  //                           <FormMessage />
  //                         </FormItem>
  //                       )}
  //                     />
  //                   </div>
  //                 </div>

  //                 {/* Academic Information */}
  //                 <div className="space-y-4">
  //                   <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
  //                     Academic Information
  //                   </h3>

  //                   <FormField
  //                     control={form.control}
  //                     name="faculty"
  //                     render={({ field }) => (
  //                       <FormItem>
  //                         <FormLabel>Faculty</FormLabel>
  //                         <Select onValueChange={field.onChange} defaultValue={field.value}>
  //                           <FormControl>
  //                             <SelectTrigger>
  //                               <SelectValue placeholder="Select your faculty" />
  //                             </SelectTrigger>
  //                           </FormControl>
  //                           <SelectContent>
  //                             {getFaculties().map((faculty) => (
  //                               <SelectItem key={faculty} value={faculty}>
  //                                 {faculty}
  //                               </SelectItem>
  //                             ))}
  //                           </SelectContent>
  //                         </Select>
  //                         <FormMessage />
  //                       </FormItem>
  //                     )}
  //                   />

  //                   <FormField
  //                     control={form.control}
  //                     name="department"
  //                     render={({ field }) => (
  //                       <FormItem>
  //                         <FormLabel>Department</FormLabel>
  //                         <Select
  //                           onValueChange={field.onChange}
  //                           defaultValue={field.value}
  //                           disabled={!selectedFaculty}
  //                         >
  //                           <FormControl>
  //                             <SelectTrigger>
  //                               <SelectValue
  //                                 placeholder={
  //                                   selectedFaculty
  //                                     ? "Select your department"
  //                                     : "Please select a faculty first"
  //                                 }
  //                               />
  //                             </SelectTrigger>
  //                           </FormControl>
  //                           <SelectContent>
  //                             {departments.map((department) => (
  //                               <SelectItem key={department} value={department}>
  //                                 {department}
  //                               </SelectItem>
  //                             ))}
  //                           </SelectContent>
  //                         </Select>
  //                         <FormMessage />
  //                       </FormItem>
  //                     )}
  //                   />
  //                 </div>

  //                 {/* Passport Photo Upload */}
  //                 <div className="space-y-4">
  //                   <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
  //                     Passport Photo
  //                   </h3>

  //                   <FormField
  //                     control={form.control}
  //                     name="passportPhoto"
  //                     render={({ field }) => (
  //                       <FormItem>
  //                         <FormLabel>Upload Passport Photo</FormLabel>
  //                         {/* <div className="space-y-4"> */}
  //                         <FormControl></FormControl>
  //                            {!uploadedFile ? (
  //                              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
  //                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
  //                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
  //                                  Click to upload or drag and drop
  //                                </div>
  //                                <div className="text-xs text-gray-500 dark:text-gray-400">
  //                                  PNG, JPG up to 2MB
  //                                </div>
  //                                <input
  //                                  type="file"
  //                                  accept="image/*"
  //                                  onChange={handleFileUpload}
  //                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  //                                />
  //                              </div>
  //                            ) : (
  //                              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
  //                                <div className="flex items-center space-x-3">
  //                                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
  //                                    <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
  //                                  </div>
  //                                  <div>
  //                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
  //                                      {uploadedFile.name}
  //                                    </div>
  //                                    <div className="text-xs text-gray-500 dark:text-gray-400">
  //                                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
  //                                    </div>
  //                                  </div>
  //                                </div>
  //                                <Button
  //                                  type="button"
  //                                  variant="ghost"
  //                                  size="sm"
  //                                  onClick={removeFile}
  //                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
  //                                >
  //                                  <X className="w-4 h-4" />
  //                                </Button>
  //                              </div>
  //                            )}
  //                          </div>
  //                        </FormControl>
  //                        <FormDescription>
  //                          Upload a clear passport-style photo for identification
  //                        </FormDescription>
  //                        <FormMessage />
  //                      </FormItem>
  //                    )}
  //                  />
  //                </div>

  //                <div className="flex justify-between pt-6">
  //                  <Button
  //                    type="button"
  //                    variant="outline"
  //                    onClick={handleCancel}
  //                  >
  //                    Cancel
  //                  </Button>
  //                  <Button
  //                    type="submit"
  //                    disabled={form.formState.isSubmitting}
  //                  >
  //                    {form.formState.isSubmitting ? 'Setting up...' : 'Complete Registration'}
  //                  </Button>
  //                </div>
  //              </form>
  //            </Form>
  //          </CardContent>
  //        </Card>
  //      </div>

  //      <CancelModal
  //        isOpen={showCancelModal}
  //        onClose={() => setShowCancelModal(false)}
  //        onConfirm={handleConfirmCancel}
  //      />
  //    </div>
  //  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Registration
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete your profile to start using ClassSync
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Please provide your details to set up your student account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="fullName">Full Name</label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Registration Number */}
              <div className="space-y-2">
                <label htmlFor="registrationNumber">Registration Number</label>
                <Input
                  id="registrationNumber"
                  {...register('registrationNumber')}
                  placeholder="e.g. 2021123456"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Registration number must start with 202 and be 10 digits
                </p>
                {errors.registrationNumber && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.registrationNumber.message}
                  </p>
                )}
              </div>

              {/* Gender and Year Level Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gender */}
                <div className="space-y-2">
                  <label htmlFor="gender">Gender</label>
                  <Select
                    onValueChange={(value) =>
                      setValue('gender', value as GenderType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                {/* Year Level */}
                <div className="space-y-2">
                  <label htmlFor="yearLevel">Year Level</label>
                  <Select
                    onValueChange={(value) =>
                      setValue('yearLevel', value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
                      <SelectItem value="600">600 Level</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.yearLevel && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.yearLevel.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Faculty */}
              <div className="space-y-2">
                <label htmlFor="faculty">Faculty</label>
                <Select
                  value={watchedFaculty}
                  onValueChange={(value) => setValue('faculty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.faculty && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.faculty.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label htmlFor="department">Department</label>
                <Select
                  value={watchedDepartment}
                  onValueChange={(value) => setValue('department', value)}
                  disabled={!watchedFaculty}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        watchedFaculty
                          ? 'Select your department'
                          : 'Select faculty first'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Passport Photo Upload */}
              <div className="space-y-2">
                <label htmlFor="passportPhoto">Passport Photo (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <label htmlFor="passportPhoto" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>
                      <span> or drag and drop</span>
                    </label>
                    <input
                      id="passportPhoto"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      {...register('passportPhoto')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!isValid || isSubmitting}>
                  {isSubmitting
                    ? 'Setting up account...'
                    : 'Complete Registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />{' '}
    </div>
  );
};

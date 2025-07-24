// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { ImageUpload } from '@/components/ImageUpload';
// import { useOnboarding } from '@/hooks/useOnboarding';
// import { Loader2 } from 'lucide-react';

// const onboardingSchema = z.object({
//   fullName: z.string().min(2, 'Full name must be at least 2 characters'),
//   gender: z.enum(['male', 'female']).optional(),
// });

// type OnboardingFormData = z.infer<typeof onboardingSchema>;

// interface OnboardingFormProps {
//   onComplete?: () => void;
// }

// export const OnboardingForm: React.FC<OnboardingFormProps> = ({
//   onComplete,
// }) => {
//   const [profileImage, setProfileImage] = useState<File | null>(null);
//   const { completeOnboarding, isLoading } = useOnboarding();

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<OnboardingFormData>({
//     resolver: zodResolver(onboardingSchema),
//   });

//   const watchedGender = watch('gender');

//   const handleImageChange = (file: File | null) => {
//     setProfileImage(file);
//   };

//   const onSubmit = (data: OnboardingFormData) => {
//     completeOnboarding(
//       {
//         fullName: data.fullName,
//         gender: data.gender,
//         profileImage: profileImage || undefined,
//       },
//       {
//         onSuccess: () => {
//           onComplete?.();
//         },
//       },
//     );
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader className="text-center">
//         <CardTitle>Complete Your Profile</CardTitle>
//         <CardDescription>
//           Add your details to get started with ClassSync
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* Profile Image Upload */}
//           <div className="flex flex-col items-center">
//             <Label className="text-sm font-medium mb-4">Profile Photo</Label>
//             <div className="mb-4">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
//                 className="hidden"
//                 id="profile-image-input"
//               />
//               <label
//                 htmlFor="profile-image-input"
//                 className="cursor-pointer block"
//               >
//                 <div className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center hover:border-primary transition-colors">
//                   {profileImage ? (
//                     <img
//                       src={URL.createObjectURL(profileImage)}
//                       alt="Profile preview"
//                       className="w-full h-full rounded-full object-cover"
//                     />
//                   ) : (
//                     <div className="text-center">
//                       <div className="text-2xl mb-1">📷</div>
//                       <div className="text-xs text-muted-foreground">
//                         Click to upload
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </label>
//             </div>
//             {profileImage && (
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setProfileImage(null)}
//                 className="text-destructive"
//               >
//                 Remove Image
//               </Button>
//             )}
//           </div>

//           {/* Full Name */}
//           <div className="space-y-2">
//             <Label htmlFor="fullName">Full Name *</Label>
//             <Input
//               id="fullName"
//               {...register('fullName')}
//               placeholder="Enter your full name"
//               className={errors.fullName ? 'border-destructive' : ''}
//             />
//             {errors.fullName && (
//               <p className="text-sm text-destructive">
//                 {errors.fullName.message}
//               </p>
//             )}
//           </div>

//           {/* Gender */}
//           <div className="space-y-3">
//             <Label>Gender (Optional)</Label>
//             <RadioGroup
//               value={watchedGender || ''}
//               onValueChange={(value) =>
//                 setValue('gender', value as 'male' | 'female')
//               }
//               className="flex gap-6"
//             >
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="male" id="male" />
//                 <Label htmlFor="male">Male</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="female" id="female" />
//                 <Label htmlFor="female">Female</Label>
//               </div>
//             </RadioGroup>
//           </div>

//           {/* Submit Button */}
//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Completing Profile...
//               </>
//             ) : (
//               'Complete Profile'
//             )}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// };

// export default OnboardingForm;

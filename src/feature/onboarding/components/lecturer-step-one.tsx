// // components/onboarding/LecturerStepOne.tsx
// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import {
//   lecturerPersonalInfoSchema,
//   LecturerPersonalInfo,
// } from '../schema/onboarding-schema';

// interface LecturerStepOneProps {
//   onNext: (data: LecturerPersonalInfo) => void;
//   onCancel: () => void;
//   initialData?: LecturerPersonalInfo;
// }

// const titles = ['Prof', 'Dr', 'Engr', 'Mr', 'Mrs', 'Ms'];

// export const LecturerStepOne = ({
//   onNext,
//   onCancel,
//   initialData,
// }:LecturerStepOneProps) => {
//   const form = useForm<LecturerPersonalInfo>({
//     resolver: zodResolver(lecturerPersonalInfoSchema),
//     defaultValues: initialData || {
//       fullName: '',
//       title: '',
//     },
//   });

//   const onSubmit = (data: LecturerPersonalInfo) => {
//     onNext(data);
//   };

//   return (
//     <div className="max-w-2xl mx-auto">
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>Personal Information</CardTitle>
//               <CardDescription>
//                 Step 1 of 3 - Tell us about yourself
//               </CardDescription>
//             </div>
//             <div className="text-sm text-gray-500">1/3</div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <FormField
//                 control={form.control}
//                 name="fullName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Full Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Enter your full name" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="title"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Title</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select your title" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {titles.map((title) => (
//                           <SelectItem key={title} value={title}>
//                             {title}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div className="flex justify-between pt-6">
//                 <Button type="button" variant="outline" onClick={onCancel}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">Next: Academic Info</Button>
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  lecturerPersonalInfoSchema,
  type LecturerPersonalInfo,
} from '../schema/onboarding-schema';

interface LecturerStepOneProps {
  onNext: (data: LecturerPersonalInfo) => void;
  onCancel: () => void;
  initialData?: LecturerPersonalInfo;
}

export function LecturerStepOne({
  onNext,
  onCancel,
  initialData,
}: LecturerStepOneProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<LecturerPersonalInfo>({
    resolver: zodResolver(lecturerPersonalInfoSchema),
    defaultValues: initialData || {
      fullName: 'Dr. John Smith', // Pre-filled mock data
      title: undefined,
    },
    mode: 'onChange',
  });

  const watchedTitle = watch('title');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div className="w-16 h-1 bg-muted"></div>
            <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="w-16 h-1 bg-muted"></div>
            <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step 1 of 3: Personal Information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {`Let's start with your basic information`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onNext)} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Select
                  value={watchedTitle}
                  onValueChange={(value) => setValue('title', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prof">Prof</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Engr">Engr</SelectItem>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                  </SelectContent>
                </Select>
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!isValid}>
                  Next Step
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

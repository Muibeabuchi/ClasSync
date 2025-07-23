import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

const demoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  profileImage: z
    .instanceof(File)
    .refine((file) => file.type.startsWith('image/'), {
      message: 'File must be an image',
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Image must be smaller than 5MB',
    })
    .optional(),
});

type DemoFormData = z.infer<typeof demoSchema>;

export function ImageUploadDemo() {
  const [submittedData, setSubmittedData] = useState<DemoFormData | null>(null);

  const form = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      name: '',
      profileImage: undefined,
    },
  });

  const onSubmit = (data: DemoFormData) => {
    console.log('Form submitted:', data);
    setSubmittedData(data);
    toast.success('Form submitted successfully!', {
      description: `Name: ${data.name}, Image: ${data.profileImage ? data.profileImage.name : 'None'}`,
    });
  };

  const resetForm = () => {
    form.reset();
    setSubmittedData(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Upload Demo</CardTitle>
          <CardDescription>
            Test the image upload component with drag & drop functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      This is just a demo field to test form integration.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profileImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={form.formState.isSubmitting}
                        maxSize={5 * 1024 * 1024} // 5MB
                      />
                    </FormControl>
                    <FormDescription>
                      Drag & drop an image or click to select. Max size: 5MB.
                      Supported formats: JPEG, PNG, GIF, WebP.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={form.formState.isSubmitting}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Display submitted data */}
      {submittedData && (
        <Card>
          <CardHeader>
            <CardTitle>Submitted Data</CardTitle>
            <CardDescription>
              {`Here's what was submitted from the form`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Name:</strong> {submittedData.name}
            </div>
            {submittedData.profileImage && (
              <div className="space-y-2">
                <strong>Profile Image:</strong>
                <div className="text-sm text-muted-foreground">
                  <div>Name: {submittedData.profileImage.name}</div>
                  <div>
                    Size: {Math.round(submittedData.profileImage.size / 1024)}{' '}
                    KB
                  </div>
                  <div>Type: {submittedData.profileImage.type}</div>
                </div>
                <div className="w-32 h-32 border rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(submittedData.profileImage)}
                    alt="Lecturer "
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

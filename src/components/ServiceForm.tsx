
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Service } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

// Zod schema for service validation
const serviceSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.number().positive({ message: "Price must be a positive number" }),
  image_url: z.string().url({ message: "Invalid image URL" }).optional().or(z.literal('')),
});

// Define the form data type explicitly
type ServiceFormData = z.infer<typeof serviceSchema>;

// Define what's expected for service submission
type ServiceSubmitData = Omit<Service, 'id' | 'created_at' | 'provider_id' | 'is_active'>;

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceSubmitData) => void;
  service?: Partial<Service>;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  service 
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(service?.image_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize the form with proper default values
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: service?.title || '',
      description: service?.description || '',
      price: service?.price || 0,
      image_url: service?.image_url || '',
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPEG, PNG, JPG)");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size should be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setSelectedFile(file);
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleSubmit = async (data: ServiceFormData) => {
    let imageUrl = data.image_url;

    // Upload image if a new file is selected
    if (selectedFile) {
      const uploadedImageUrl = await uploadImageToStorage(selectedFile);
      if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
      } else {
        // Stop submission if upload fails
        return;
      }
    }

    // Ensure data meets the requirements of ServiceSubmitData
    const submitData: ServiceSubmitData = {
      title: data.title,
      description: data.description,
      price: data.price,
      image_url: imageUrl || undefined,
    };
    
    onSubmit(submitData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogDescription>
            {service ? 'Update your existing service details' : 'Create a new service listing'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tutoring, Graphic Design" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Provide details about your service" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Set your service price" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Service Image</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  className="mb-2" 
                />
              </FormControl>
              {imagePreview && (
                <div className="mt-2 mb-2">
                  <img 
                    src={imagePreview} 
                    alt="Service preview" 
                    className="max-w-full h-48 object-cover rounded" 
                  />
                  <Button 
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              )}
              <FormDescription>
                A preview image that represents your service
              </FormDescription>
            </FormItem>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {service ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceForm;

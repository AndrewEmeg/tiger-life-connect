
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

type ProductFormData = Omit<Product, "id" | "created_at" | "seller_id" | "is_active" | "seller">;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  isOpen,
  onClose,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue } = useForm<ProductFormData>({
    defaultValues: product ? {
      title: product.title,
      description: product.description,
      price: product.price,
      image_url: product.image_url || "",
    } : {
      title: "",
      description: "",
      price: 0,
      image_url: "",
    },
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

  const onSubmitForm = async (data: ProductFormData) => {
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

    onSubmit({ ...data, image_url: imageUrl });
    reset();
    setImagePreview(null);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="Product title"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description", { required: true })}
              placeholder="Product description"
            />
          </div>
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price", { required: true, min: 0 })}
            />
          </div>
          <div>
            <Label>Product Image</Label>
            <Input 
              type="file" 
              accept="image/jpeg,image/png,image/jpg" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              className="mb-2" 
            />
            {imagePreview && (
              <div className="mt-2 mb-2">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
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
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {product ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;


import { useState, useRef, ChangeEvent } from "react";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileImageUploadProps {
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  onImageUpdated?: (url: string) => void;
}

const ProfileImageUpload = ({ imageUrl, size = "lg", onImageUpdated }: ProfileImageUploadProps) => {
  const { user, updateUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32"
  };

  // Generate a fallback based on user's name or email
  const generateFallback = () => {
    if (!user) return "?";
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || "?";
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, GIF, and WebP files are allowed");
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('profiles').getPublicUrl(fileName);
      
      if (!data.publicUrl) throw new Error("Failed to get public URL");

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image: data.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update context
      updateUserProfile({ profile_image: data.publicUrl });
      
      // Call the callback if provided
      if (onImageUpdated) {
        onImageUpdated(data.publicUrl);
      }
      
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative inline-block group">
      <Avatar className={`${sizeClasses[size]} border-2 border-white shadow-sm`}>
        <AvatarImage src={imageUrl || ''} alt="Profile" />
        <AvatarFallback className="bg-tigerGold text-tigerBlack font-semibold">
          {isUploading ? "..." : generateFallback()}
        </AvatarFallback>
      </Avatar>
      
      {/* Edit overlay */}
      <div 
        className="absolute top-0 right-0 p-1 bg-tigerGold rounded-full shadow-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => fileInputRef.current?.click()}
      >
        <Pencil className="h-3 w-3 text-tigerBlack" />
      </div>
      
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/png, image/jpeg, image/gif, image/webp"
        disabled={isUploading}
      />
    </div>
  );
};

export default ProfileImageUpload;

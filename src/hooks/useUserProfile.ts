
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Product, Service, Order } from "@/types";

export function useUserProfile() {
  const { user } = useAuth();

  const { data: userProfile, isLoading: isLoadingUserProfile } = useQuery({
    queryKey: ["userProfileDetails", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      // Add any profile data to the user metadata
      if (data && user) {
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            profile_image: data.profile_image,
          }
        };
        return updatedUser;
      }
      
      return user;
    },
    enabled: !!user?.id,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["userProducts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .eq("is_active", true);
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user?.id,
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["userServices", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("provider_id", user.id)
        .eq("is_active", true);
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!user?.id,
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["userOrders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get orders where the user is either buyer or seller
      const { data, error } = await supabase
        .from("orders")
        .select(`*`)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // For each order, get the associated product or service
      const ordersWithDetails = await Promise.all(data.map(async (order) => {
        // Ensure item_type is either "product" or "service"
        const safeItemType = order.item_type === "product" || order.item_type === "service" 
          ? order.item_type
          : "product"; // Default to product if somehow invalid
        
        if (safeItemType === "product") {
          const { data: productData } = await supabase
            .from("products")
            .select("title,description,image_url")
            .eq("id", order.item_id)
            .single();
            
          return { 
            ...order, 
            item_type: safeItemType,
            item: productData 
          };
        } else {
          const { data: serviceData } = await supabase
            .from("services")
            .select("title,description,image_url")
            .eq("id", order.item_id)
            .single();
            
          return { 
            ...order, 
            item_type: safeItemType,
            item: serviceData 
          };
        }
      }));
      
      return ordersWithDetails as Order[];
    },
    enabled: !!user?.id,
  });

  return {
    user: userProfile || user,
    products,
    services,
    orders,
    isLoading: isLoadingUserProfile || isLoadingProducts || isLoadingServices || isLoadingOrders,
  };
}

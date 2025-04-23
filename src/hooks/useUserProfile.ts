
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Product, Service, Order } from "@/types";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Define a combined user type to handle both our custom User and Supabase User
type CombinedUser = {
  id: string;
  email?: string;
  full_name?: string;
  joined_at?: string;
  created_at?: string;
  is_admin?: boolean;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    profile_image?: string;
  };
  app_metadata?: any;
  [key: string]: any;
};

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
      
      console.log("Fetching orders for user:", user.id);
      
      // Get orders where the user is either buyer or seller
      const { data, error } = await supabase
        .from("orders")
        .select(`*`)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      
      console.log("Found orders:", data?.length || 0);
      
      // For each order, get the associated product or service
      const ordersWithDetails = await Promise.all((data || []).map(async (order) => {
        try {
          // Ensure item_type is either "product" or "service"
          const safeItemType = order.item_type === "product" || order.item_type === "service" 
            ? order.item_type
            : "product"; // Default to product if somehow invalid
          
          // Ensure status is one of the valid types
          const safeStatus = ['processing', 'completed', 'cancelled'].includes(order.status)
            ? order.status as "processing" | "completed" | "cancelled"
            : "processing";
          
          console.log(`Fetching ${safeItemType} details for order:`, order.id);
            
          if (safeItemType === "product") {
            const { data: productData } = await supabase
              .from("products")
              .select("title,description,image_url")
              .eq("id", order.item_id)
              .maybeSingle();
              
            return { 
              ...order, 
              item_type: safeItemType,
              status: safeStatus,
              item: productData || { 
                title: "Product no longer available", 
                description: "This product has been removed." 
              }
            };
          } else {
            const { data: serviceData } = await supabase
              .from("services")
              .select("title,description,image_url")
              .eq("id", order.item_id)
              .maybeSingle();
              
            return { 
              ...order, 
              item_type: safeItemType,
              status: safeStatus,
              item: serviceData || { 
                title: "Service no longer available", 
                description: "This service has been removed." 
              }
            };
          }
        } catch (err) {
          console.error("Error getting item details for order:", order.id, err);
          return { 
            ...order,
            item_type: (order.item_type || "product") as "product" | "service",
            status: (order.status || "processing") as "processing" | "completed" | "cancelled",
            item: { 
              title: "Item not found", 
              description: "There was an error loading this item."
            }
          };
        }
      }));
      
      return ordersWithDetails as Order[];
    },
    enabled: !!user?.id,
    // Add refetchInterval to periodically check for order updates
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  return {
    user: userProfile as CombinedUser,
    products,
    services,
    orders,
    isLoading: isLoadingUserProfile || isLoadingProducts || isLoadingServices || isLoadingOrders,
  };
}

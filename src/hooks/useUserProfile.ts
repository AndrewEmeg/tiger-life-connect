
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Product, Service, Order } from "@/types";

export function useUserProfile() {
  const { user } = useAuth();

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
        if (order.item_type === "product") {
          const { data: productData } = await supabase
            .from("products")
            .select("title,description,image_url")
            .eq("id", order.item_id)
            .single();
            
          return { ...order, item: productData };
        } else {
          const { data: serviceData } = await supabase
            .from("services")
            .select("title,description,image_url")
            .eq("id", order.item_id)
            .single();
            
          return { ...order, item: serviceData };
        }
      }));
      
      return ordersWithDetails as Order[];
    },
    enabled: !!user?.id,
  });

  return {
    user,
    products,
    services,
    orders,
    isLoading: isLoadingProducts || isLoadingServices || isLoadingOrders,
  };
}


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

  // For now, we'll return an empty array for orders since there's no orders table
  // This can be implemented later when an orders table is created
  const orders: Order[] = [];
  const isLoadingOrders = false;

  return {
    user,
    products,
    services,
    orders,
    isLoading: isLoadingProducts || isLoadingServices || isLoadingOrders,
  };
}

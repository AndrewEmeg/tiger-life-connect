
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

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["userOrders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*, item(*)")
        .eq("buyer_id", user.id);
      if (error) throw error;
      return data as Order[];
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

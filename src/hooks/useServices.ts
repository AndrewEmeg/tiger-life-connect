
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Service, User } from "@/types";
import { toast } from "@/components/ui/sonner";

export const useServices = () => {
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          provider:users(*)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Service & { provider: User })[];
    },
  });

  const createService = useMutation({
    mutationFn: async (service: Omit<Service, "id" | "created_at" | "provider_id" | "is_active">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("services")
        .insert({
          ...service,
          provider_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service created successfully");
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Service> & { id: string }) => {
      const { error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service updated successfully");
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("services")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deleted successfully");
    },
  });

  return {
    services,
    isLoading,
    createService,
    updateService,
    deleteService,
  };
};

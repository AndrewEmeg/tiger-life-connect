
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useEvents() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;

  // Fetch events based on user role
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      let query = supabase.from("events").select("*, organizer:users(*)");
      
      if (!isAdmin) {
        query = query.or(`is_approved.eq.true,organizer_id.eq.${user?.id}`);
      }
      
      const { data, error } = await query.order("event_datetime", { ascending: true });
      
      if (error) throw error;
      return data as unknown as Event[];
    },
  });

  // Create new event
  const createEvent = useMutation({
    mutationFn: async (newEvent: Omit<Event, "id" | "created_at" | "is_approved" | "organizer_id">) => {
      const { data, error } = await supabase
        .from("events")
        .insert([{ ...newEvent, organizer_id: user!.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit event");
      console.error("Error creating event:", error);
    },
  });

  // Update event
  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updatedEvent }: Partial<Event> & { id: string }) => {
      const { data, error } = await supabase
        .from("events")
        .update(updatedEvent)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update event");
      console.error("Error updating event:", error);
    },
  });

  // Delete event
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete event");
      console.error("Error deleting event:", error);
    },
  });

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    isAdmin,
  };
}

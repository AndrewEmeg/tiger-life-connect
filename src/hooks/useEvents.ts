
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useEvents() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // Check for admin status in user's custom_claims or other properties
  const isAdmin = user?.user_metadata?.is_admin === true || user?.app_metadata?.is_admin === true;

  // Fetch events based on user role
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      console.log("Fetching events, user is admin:", isAdmin, "User object:", user);
      let query = supabase.from("events").select("*, organizer:users(*)");
      
      if (!isAdmin) {
        // Regular users see approved events or their own events
        if (user?.id) {
          query = query.or(`is_approved.eq.true,organizer_id.eq.${user.id}`);
        } else {
          query = query.eq('is_approved', true);
        }
      }
      
      const { data, error } = await query.order("event_datetime", { ascending: true });
      
      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
      
      console.log("Fetched events:", data);
      return data as unknown as Event[];
    },
    enabled: !!user, // Only run query if user is logged in
  });

  // Create new event
  const createEvent = useMutation({
    mutationFn: async (newEvent: Omit<Event, "id" | "created_at" | "is_approved" | "organizer_id">) => {
      console.log("Creating event:", newEvent, "User ID:", user?.id);
      const { data, error } = await supabase
        .from("events")
        .insert([{ ...newEvent, organizer_id: user!.id, is_approved: false }])
        .select()
        .single();

      if (error) {
        console.error("Error creating event:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event submitted successfully! Waiting for admin approval.");
    },
    onError: (error) => {
      toast.error("Failed to submit event");
      console.error("Error creating event:", error);
    },
  });

  // Update event
  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updatedEvent }: Partial<Event> & { id: string }) => {
      console.log("Updating event:", id, updatedEvent);
      const { data, error } = await supabase
        .from("events")
        .update(updatedEvent)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating event:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      const actionType = data.is_approved ? "approved" : "updated";
      toast.success(`Event ${actionType} successfully!`);
    },
    onError: (error) => {
      toast.error("Failed to update event");
      console.error("Error updating event:", error);
    },
  });

  // Delete event
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting event:", id);
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) {
        console.error("Error deleting event:", error);
        throw error;
      }
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

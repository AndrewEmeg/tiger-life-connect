import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export function useEvents() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    // Fetch admin status from users table (not Supabase auth metadata)
    useEffect(() => {
        const checkAdmin = async () => {
            if (user?.id) {
                const { data, error } = await supabase
                    .from("users")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single();

                if (error) {
                    console.error("Error fetching admin status:", error);
                } else {
                    setIsAdmin(data?.is_admin === true);
                }
            }
        };

        checkAdmin();
    }, [user]);

    // Fetch events
    const { data: events = [], isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            let query = supabase.from("events").select("*, organizer:users(*)");

            if (!isAdmin) {
                if (user?.id) {
                    query = query.or(
                        `is_approved.eq.true,organizer_id.eq.${user.id}`
                    );
                } else {
                    query = query.eq("is_approved", true);
                }
            }

            const { data, error } = await query.order("event_datetime", {
                ascending: true,
            });

            if (error) {
                console.error("Error fetching events:", error);
                throw error;
            }

            return data as unknown as Event[];
        },
        enabled: !!user,
    });

    // Create new event
    const createEvent = useMutation({
        mutationFn: async (
            newEvent: Omit<
                Event,
                "id" | "created_at" | "is_approved" | "organizer_id"
            >
        ) => {
            const { data, error } = await supabase
                .from("events")
                .insert([
                    { ...newEvent, organizer_id: user!.id, is_approved: false },
                ])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            toast.success(
                "Event submitted successfully! Waiting for admin approval."
            );
        },
        onError: () => {
            toast.error("Failed to submit event");
        },
    });

    // Update (approve/disapprove/edit) event
    const updateEvent = useMutation({
        mutationFn: async ({
            id,
            ...updatedEvent
        }: Partial<Event> & { id: string }) => {
            const { data, error } = await supabase
                .from("events")
                .update(updatedEvent)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            const action = data.is_approved ? "approved" : "disapproved";
            toast.success(`Event ${action} successfully!`);
        },
        onError: () => {
            toast.error("Failed to update event");
        },
    });

    // Delete event
    const deleteEvent = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            toast.success("Event deleted successfully!");
        },
        onError: () => {
            toast.error("Failed to delete event");
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

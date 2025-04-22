import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Event } from "@/types";

const eventSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    event_datetime: z.string().min(1),
    location: z.string().min(3),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
    event?: Partial<Event>;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (
        data: Omit<Event, "id" | "created_at" | "is_approved" | "organizer_id">
    ) => void;
}

const EventForm: React.FC<EventFormProps> = ({
    event,
    isOpen,
    onClose,
    onSubmit,
}) => {
    const form = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: event?.title || "",
            description: event?.description || "",
            event_datetime: event?.event_datetime
                ? new Date(event.event_datetime).toISOString().slice(0, 16)
                : "",
            location: event?.location || "",
        },
    });

    const handleSubmit = (data: EventFormData) => {
        const eventData = {
            title: data.title,
            description: data.description,
            event_datetime: data.event_datetime,
            location: data.location,
        };
        onSubmit(eventData);
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {event ? "Edit Event" : "Create New Event"}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="event_datetime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date and Time</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="datetime-local"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {event ? "Update Event" : "Create Event"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default EventForm;

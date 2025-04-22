import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import EventForm from "@/components/EventForm";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Events = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { events, isLoading, createEvent, updateEvent, isAdmin } =
        useEvents();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<string>("approved");

    const approvedEvents = events.filter((event) => event.is_approved);
    const myPendingEvents = events.filter(
        (event) => !event.is_approved && event.organizer_id === user?.id
    );
    const adminPendingEvents = events.filter((event) => !event.is_approved);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Campus Events</h1>
                <Button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-tigerGold text-tigerBlack hover:bg-tigerGold/90"
                >
                    <Plus className="mr-2 h-4 w-4" /> Submit Event
                </Button>
            </div>

            <Tabs
                defaultValue="approved"
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6"
            >
                <TabsList>
                    <TabsTrigger value="approved">
                        All Approved Events
                    </TabsTrigger>
                    <TabsTrigger value="my-pending">
                        My Pending Events
                    </TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger value="admin-pending">
                            Pending Review
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="approved">
                    {isLoading ? (
                        <LoadingState message="Loading events..." />
                    ) : approvedEvents.length === 0 ? (
                        <EmptyState message="No approved events found. Submit one to get started!" />
                    ) : (
                        <EventGrid
                            events={approvedEvents}
                            isAdmin={isAdmin}
                            isPending={false}
                            onToggleApproval={(id, approve) =>
                                updateEvent.mutate({ id, is_approved: approve })
                            }
                        />
                    )}
                </TabsContent>

                <TabsContent value="my-pending">
                    {isLoading ? (
                        <LoadingState message="Loading your pending events..." />
                    ) : myPendingEvents.length === 0 ? (
                        <EmptyState message="You don't have any pending events. Submit a new event for approval!" />
                    ) : (
                        <EventGrid events={myPendingEvents} />
                    )}
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="admin-pending">
                        {isLoading ? (
                            <LoadingState message="Loading unapproved events..." />
                        ) : adminPendingEvents.length === 0 ? (
                            <EmptyState message="No pending events to review." />
                        ) : (
                            <EventGrid
                                events={adminPendingEvents}
                                isAdmin
                                isPending
                                onToggleApproval={(id, approve) => {
                                    console.log(
                                        "Admin approving/disapproving:",
                                        id,
                                        approve
                                    );
                                    updateEvent.mutate({
                                        id,
                                        is_approved: approve,
                                    });
                                }}
                            />
                        )}
                    </TabsContent>
                )}
            </Tabs>

            <EventForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={createEvent.mutate}
            />
        </div>
    );
};

export default Events;

const LoadingState = ({ message }: { message: string }) => (
    <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-tigerGold border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>{message}</p>
    </div>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center text-gray-500 py-8">{message}</div>
);

const EventGrid = ({
    events,
    isAdmin,
    isPending,
    onToggleApproval,
}: {
    events: any[];
    isAdmin?: boolean;
    isPending?: boolean;
    onToggleApproval?: (id: string, approve: boolean) => void;
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
            <EventCard
                key={event.id}
                event={event}
                isAdmin={isAdmin}
                isPending={isPending}
                onToggleApproval={onToggleApproval}
            />
        ))}
    </div>
);

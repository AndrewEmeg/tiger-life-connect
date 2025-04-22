
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
  const { events, isLoading, createEvent } = useEvents();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("approved");

  // Filter events based on the active tab
  const approvedEvents = events.filter((event) => event.is_approved);
  const pendingEvents = events.filter((event) => !event.is_approved && event.organizer_id === user?.id);

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

      <Tabs defaultValue="approved" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="approved">Approved Events</TabsTrigger>
          <TabsTrigger value="my-pending">My Pending Events</TabsTrigger>
        </TabsList>
        <TabsContent value="approved">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-tigerGold border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading events...</p>
            </div>
          ) : approvedEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No approved events found. Submit one to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="my-pending">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-tigerGold border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading your pending events...</p>
            </div>
          ) : pendingEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              You don't have any pending events. Submit a new event for approval!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingEvents.map((event) => (
                <EventCard key={event.id} event={event} isPending />
              ))}
            </div>
          )}
        </TabsContent>
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


import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import EventForm from "@/components/EventForm";

const Events = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { events, isLoading, createEvent } = useEvents();

  const approvedEvents = events.filter((event) => event.is_approved);

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

      {isLoading ? (
        <div className="text-center">Loading events...</div>
      ) : approvedEvents.length === 0 ? (
        <div className="text-center text-gray-500">
          No approved events found. Submit one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <EventForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={createEvent.mutate}
      />
    </div>
  );
};

export default Events;

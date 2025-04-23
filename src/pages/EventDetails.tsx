
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EventDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Coming Soon!</h1>
        <p className="text-gray-600 text-lg">
          Hey! This is just a placeholder page for all events at the moment. When
          this app launches, this page will become the registration page for
          individual events.
        </p>
        <Button
          onClick={() => navigate("/events")}
          variant="outline"
          className="mt-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    </div>
  );
};

export default EventDetails;

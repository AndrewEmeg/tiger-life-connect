
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const AdminEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, isLoading, updateEvent, deleteEvent, isAdmin } = useEvents();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const filteredEvents = events.filter((event) => {
    if (filter === "pending") return !event.is_approved;
    if (filter === "approved") return event.is_approved;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Event Management</h1>
      
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          onClick={() => setFilter("approved")}
        >
          Approved
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading events...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.organizer?.full_name}</TableCell>
                  <TableCell>
                    {format(new Date(event.event_datetime), "PPp")}
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.is_approved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {event.is_approved ? "Approved" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant={event.is_approved ? "outline" : "default"}
                      onClick={() =>
                        updateEvent.mutate({
                          id: event.id,
                          is_approved: !event.is_approved,
                        })
                      }
                    >
                      {event.is_approved ? "Revoke" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this event?")) {
                          deleteEvent.mutate(event.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;

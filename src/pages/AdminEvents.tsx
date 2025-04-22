
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";

const AdminEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, isLoading, updateEvent, deleteEvent, isAdmin } = useEvents();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  // If still loading user or not logged in, show loading
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-tigerGold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not admin, don't render anything (will redirect)
  if (!isAdmin) return null;

  const filteredEvents = events.filter((event) => {
    if (filter === "pending") return !event.is_approved;
    if (filter === "approved") return event.is_approved;
    return true;
  });

  const handleApprove = (id: string, currentStatus: boolean) => {
    updateEvent.mutate({
      id,
      is_approved: !currentStatus
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEvent.mutate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Event Management</h1>
      
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          className={filter === "pending" ? "bg-tigerGold text-tigerBlack hover:bg-tigerGold/90" : ""}
        >
          Pending
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          onClick={() => setFilter("approved")}
          className={filter === "approved" ? "bg-tigerGold text-tigerBlack hover:bg-tigerGold/90" : ""}
        >
          Approved
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-tigerGold text-tigerBlack hover:bg-tigerGold/90" : ""}
        >
          All
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-tigerGold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No {filter !== 'all' ? filter : ''} events found.</p>
        </div>
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
                  <TableCell>{event.organizer?.full_name || 'Unknown'}</TableCell>
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
                      onClick={() => handleApprove(event.id, event.is_approved)}
                      className={!event.is_approved ? "bg-tigerGold text-tigerBlack hover:bg-tigerGold/90" : ""}
                    >
                      {event.is_approved ? "Revoke" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(event.id)}
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

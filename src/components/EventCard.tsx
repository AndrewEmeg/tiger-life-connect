import React from "react";
import { Link } from "react-router-dom";
import { Event } from "@/types";
import { format } from "date-fns";

interface EventCardProps {
    event: Event;
    isPending?: boolean;
    isAdmin?: boolean;
    onToggleApproval?: (id: string, approve: boolean) => void;
}

const EventCard: React.FC<EventCardProps> = ({
    event,
    isPending = false,
    isAdmin = false,
    onToggleApproval,
}) => {
    const eventDate = new Date(event.event_datetime);

    const handleApprove = (id: string, approve: boolean) => {
        console.log(
            `Admin ${approve ? "approving" : "disapproving"} event:`,
            id,
            event.title
        );
        onToggleApproval?.(id, approve);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    {event.is_approved ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Official
                        </span>
                    ) : isPending ? (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Pending
                        </span>
                    ) : null}
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {event.description}
                </p>

                <div className="flex flex-col gap-1 mb-4">
                    <div className="text-sm text-gray-600">
                        📅 {format(eventDate, "MMMM d, yyyy")}
                    </div>
                    <div className="text-sm text-gray-600">
                        ⏰ {format(eventDate, "h:mm a")}
                    </div>
                    <div className="text-sm text-gray-600">
                        📍 {event.location}
                    </div>
                    {event.organizer && (
                        <div className="text-sm text-gray-600">
                            👤 {event.organizer.full_name || "Unknown Organizer"}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <Link
                        to={`/events/${event.id}`}
                        className="bg-tigerBlack text-white text-xs px-3 py-1 rounded-full hover:bg-gray-800"
                    >
                        View Details
                    </Link>

                    {isAdmin && (
                        <div className="flex gap-2">
                            {!event.is_approved ? (
                                <button
                                    onClick={() => handleApprove(event.id, true)}
                                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                >
                                    Approve
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleApprove(event.id, false)}
                                    className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                >
                                    Disapprove
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;

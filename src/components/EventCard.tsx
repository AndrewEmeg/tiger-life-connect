
import React from "react";
import { Link } from "react-router-dom";
import { Event } from "@/types";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  isPending?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isPending = false }) => {
  const eventDate = new Date(event.event_datetime);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{event.title}</h3>
          {event.is_approved ? (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Official</span>
          ) : isPending ? (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span>
          ) : null}
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description}</p>
        
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {format(eventDate, "MMMM d, yyyy")}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {format(eventDate, "h:mm a")}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Link 
            to={`/events/${event.id}`}
            className="bg-tigerBlack text-white text-xs px-3 py-1 rounded-full hover:bg-gray-800"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

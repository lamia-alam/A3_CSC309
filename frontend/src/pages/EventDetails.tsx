import React, { useEffect, useState } from "react";
import { EventType } from "../components/events/EventTable";
import { User } from "./Users";
import { EventGuests } from "../components/events/EventGuests";
import { EventOrganizers } from "../components/events/EventOrganizers";
import { Link, useParams } from "react-router-dom";
import { api } from "../config/api";
import { Pages } from "../constants/pages";
import { useNavigate } from 'react-router-dom'

type UserType = Pick<User, "id" | "name" | "utorid">;

export type EventDetailsType = EventType & {
  guests: UserType[];
  organizers: UserType[];
};

export const EventDetails: React.FC = () => {
  const navigate = useNavigate()
  const { id: eventId } = useParams<{ id: string }>();

  const [eventDetails, setEventDetails] = useState<EventDetailsType | null>(
    null
  );

  const getEventDetails = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      console.log(response.data);
      setEventDetails(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  useEffect(() => {
    getEventDetails();
  }, []);

  if (!eventDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <button className="btn btn-link justify-start" onClick={() => navigate(-1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Back
      </button>
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          {eventDetails.published ? (
            <span className="badge badge-success">Published</span>
          ) : (
            <span className="badge  badge-warning">Unpublished</span>
          )}
          <div className="flex justify-between">
            <h2 className="text-3xl font-bold">{eventDetails.name}</h2>
            <span className="text-xl">
              {eventDetails.pointsAwarded + eventDetails.pointsRemain} Points
            </span>
          </div>
          <ul className="mt-6 flex flex-col gap-2">
            <li>
              <span>{eventDetails.description}</span>
            </li>
            <li>
              <span>Location: {eventDetails.location}</span>
            </li>
            <li>
              <>
                Live between:{" "}
                {new Date(eventDetails.startTime).toLocaleString()} -{" "}
                {new Date(eventDetails.endTime).toLocaleString()}
              </>
            </li>
          </ul>
        </div>
      </div>
      <EventOrganizers
        eventDetails={eventDetails}
        refreshEventDetails={getEventDetails}
      />
      <EventGuests
        eventDetails={eventDetails}
        refreshEventDetails={getEventDetails}
      />
    </div>
  );
};

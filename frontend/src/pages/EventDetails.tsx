import React, { useEffect, useState } from "react";
import { EventType } from "../components/events/EventTable";
import { User } from "./Users";
import { EventGuests } from "../components/events/EventGuests";
import { EventOrganizers } from "../components/events/EventOrganizers";
import { useParams } from "react-router-dom";
import { api } from "../config/api";
import { useNavigate } from "react-router-dom";
import { AwardPointsEvent } from "../components/events/AwardPointsEvent";

export type UserType = Pick<User, "id" | "name" | "utorid">;

export type EventDetailsType = EventType & {
  guests: UserType[];
  organizers: UserType[];
};

export const checkEventActive = (
  eventDetails: EventDetailsType | null
): boolean => {
  if (!eventDetails) {
    return false;
  }
  const currentDate = new Date();
  const startTime = new Date(eventDetails.startTime);
  const endTime = new Date(eventDetails.endTime);

  return (
    eventDetails.published &&
    currentDate >= startTime &&
    currentDate <= endTime
  );
}

export const EventDetails: React.FC = () => {
  const navigate = useNavigate();
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

  const isActive = checkEventActive(eventDetails as EventDetailsType);

  useEffect(() => {
    getEventDetails();
  }, []);

  if (!eventDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-10/12 mx-auto">
      <div>
        <button
          className="btn btn-ghost justify-start btn-sm"
          onClick={() => navigate(-1)}
        >
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
      </div>
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          {eventDetails.published ? (
            <span className="badge badge-success">Published</span>
          ) : (
            <span className="badge  badge-warning">Unpublished</span>
          )}
          <div className="flex justify-between">
            <h2 className="text-3xl font-bold">{eventDetails.name}</h2>
            {eventDetails.guests.length > 0 &&
              isActive ? (
              <AwardPointsEvent
                eventId={eventDetails.id}
                refreshEvent={getEventDetails}
              />
              ) : null}
          </div>
          <ul className="mt-6 flex flex-col gap-2">
            <li>
              <span>{eventDetails.description}</span>
            </li>
          </ul>

          <div className="stats stats-vertical lg:stats-horizontal shadow">
            <div className="stat">
              <div className="stat-title">Location</div>
              <div className="stat-value">{eventDetails.location}</div>
              {/* <div className="stat-desc">Jan 1st - Feb 1st</div> */}
            </div>

            <div className="stat">
              <div className="stat-title">Status</div>
              <div className="stat-value">
                {new Date() >= new Date(eventDetails.startTime) &&
                new Date() <= new Date(eventDetails.endTime)
                  ? "Active"
                  : "Inactive"}
              </div>
              <div className="stat-desc">
                {new Date(eventDetails.startTime).toLocaleString()} -{" "}
                {new Date(eventDetails.endTime).toLocaleString()}
              </div>
            </div>

            <div className="stat">
              <div className="stat-title">Points</div>
              <div className="stat-value">
                {eventDetails.pointsRemain}
              </div>
              <div className="stat-desc">
                {eventDetails.pointsAwarded} awarded
              </div>
            </div>
          </div>
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

import React, { useEffect, useState } from "react";
import { api } from "../config/api";

type Event = {
  id: number;
  name: string;
  location: string;
  startTime: string;
  endTime: string;
  numGuests: number;
  pointsAwarded: number;
  pointsRemain: number;
  published: boolean;
  capacity: number | null;
};

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    const response = await api.get("/events");
    console.log(response.data.results);
    setEvents(response.data.results);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <>
      <div>Events</div>
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th># Guests</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Points</th>
              <th>Published</th>
              <th>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {events.map((event) => (
              <tr key={event.id}>
                <th>{event.id}</th>
                <td>{event.name} {event.published && <span className="badge badge-success">Published</span>}</td>
                <td>{event.location}</td>
                <td>{event.numGuests}</td>
                <td>{new Date(event.startTime).toLocaleString()}</td>
                <td>{new Date(event.endTime).toLocaleString()}</td>
                <td>{event.pointsAwarded}</td>
                <td>{event.published ? "Yes" : "No"}</td>
                <td>{event.capacity ? event.capacity : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

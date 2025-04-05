import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import { EventType } from "../../../pages/Events";
import { AxiosError } from "axios";
import { api } from "../../../config/api";
import { useNotification } from "../../../context/NotificationContext";
import { useEvent } from "../../../context/EventContext";

export const RSVPEvent: React.FC<{
  params: ICellRendererParams<EventType>;
}> = ({ params }) => {
  const {refreshEvents} = useEvent()
  const { createNotification } = useNotification();
  const rsvpEvent = async (eventId: number) => {
    try {
      const response = await api.post(`/events/${eventId}/guests/me`);
      if (response.status === 201) {
        createNotification({ message: "RSVP successful", type: "success" });
        refreshEvents();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          // The request was made and the server responded with a status code
          createNotification({
            message: error.response.data.error,
            type: "error",
          });
        } else {
          // The request was made but no response was received
          createNotification({ message: "Network error", type: "error" });
        }
      }
    }
  };

  if (
    params.data &&
    params.data.published &&
    (params.data.capacity === null ||
      params.data.capacity > params.data.numGuests) &&
    params.data.endTime > new Date().toISOString()
  ) {
    return (
      <button
        className="btn btn-xs btn-primary"
        onClick={() => params.data && rsvpEvent(params.data.id)}
      >
        RSVP
      </button>
    );
  }
};

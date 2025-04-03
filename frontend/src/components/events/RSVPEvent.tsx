import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import { EventType } from "../../pages/Events";
import { AxiosError } from "axios";
import { api } from "../../config/api";
import { useNotification } from "../../context/NotificationContext";

export const RSVPEvent: React.FC<{
  params: ICellRendererParams<EventType>;
  refreshData: () => void;
}> = ({ params, refreshData }) => {
  const { createNotification } = useNotification();
  const rsvpEvent = async (eventId: number) => {
    try {
      const response = await api.post(`/events/${eventId}/guests/me`);
      if (response.status === 201) {
        createNotification("RSVP successful", "success");
        refreshData();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          // The request was made and the server responded with a status code
          createNotification(error.response.data.error, "error");
        } else {
          // The request was made but no response was received
          createNotification("Network error", "error");
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

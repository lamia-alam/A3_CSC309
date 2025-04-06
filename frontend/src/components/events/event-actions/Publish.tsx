import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import { AxiosError } from "axios";
import { api } from "../../../config/api";
import { useNotification } from "../../../context/NotificationContext";
import { useEvent } from "../../../context/EventContext";
import { EventType } from "../EventTable";

export const PublishEvent: React.FC<{
  params: ICellRendererParams<EventType>;
}> = ({ params }) => {
  const {refreshEvents} = useEvent()
  const { createNotification } = useNotification();
  const publishEvent = async (eventId: number) => {
    try {
      const response = await api.patch(`/events/${eventId}`, {
        published: true,
      });
      if (response.status === 200) {
        createNotification({message: "Event published", type: "success"});
        refreshEvents();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          // The request was made and the server responded with a status code
          createNotification({message: error.response.data.error, type: "error"});
        } else {
          // The request was made but no response was received
          createNotification({message: "Network error", type: "error"});
        }
      }
    }
  };

  if (
    params.data &&
    !params.data.published &&
    params.data.endTime > new Date().toISOString()
  ) {
    return (
      <button
        className="btn btn-xs btn-primary"
        onClick={() => params.data && publishEvent(params.data.id)}
      >
        Publish
      </button>
    );
  }
};

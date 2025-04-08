import React, { useEffect, useRef } from "react";
import { useNotification } from "../../context/NotificationContext";
import { api } from "../../config/api";
import { EventForm } from "./EventForm";
import { useEvent } from "../../context/EventContext";


export const EditEventDrawer: React.FC<{
}> = () => {
  const {selectEventId} = useEvent()
  const modalCheckboxRef = useRef<HTMLInputElement>(null);
  const { createNotification } = useNotification();

  type FormData = {
    name: string;
    location: string;
    startTime?: Date;
    endTime?: Date;
    description: string;
    capacity: number | null;
    points: number;
  };

  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    location: "",
    description: "",
    capacity: null,
    points: 0,
  });


  const handleClose = () => {
    modalCheckboxRef.current!.checked = false;
  };

  const fetchEventById = async (eventId: number) => {
    const response = await api.get(`/events/${eventId}`);
    if (response.status === 200) {
      const event = response.data;
      setFormData({
        name: event.name,
        location: event.location,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        description: event.description,
        capacity: event.capacity,
        points: event.points,
      });
    } else {
      createNotification({
        type: "error",
        message: "Failed to fetch event data",
      });
    }
  };

  

  useEffect(() => {
    if (!selectEventId) return;
    fetchEventById(selectEventId);
  }, [selectEventId]);

  return (
    <>
      <div className="drawer drawer-end">
        <input
          id="edit-event-drawer"
          type="checkbox"
          ref={modalCheckboxRef}
          className="drawer-toggle"
        />
        <div className="drawer-side z-10">
          <label
            htmlFor="edit-event-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-base-200 text-base-content min-h-full w-96 p-4">
            {/* Sidebar content here */}
            <h3 className="font-bold text-lg">Edit: {formData.name}</h3>
            <EventForm
              handleClose={handleClose}
              eventId={selectEventId}
            />
          </ul>
        </div>
      </div>
    </>
  );
};

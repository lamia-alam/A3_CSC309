import React, { useEffect, useRef } from "react";
import { useNotification } from "../../context/NotificationContext";
import { api } from "../../config/api";
const formatDateTimeAsISO = (date: Date) => {
  const padToTwoDigits = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${padToTwoDigits(
    date.getMonth() + 1
  )}-${padToTwoDigits(date.getDate())}T${padToTwoDigits(
    date.getHours()
  )}:${padToTwoDigits(date.getMinutes())}`;
};

export const EventForm: React.FC<{
  refreshData: () => void;
  eventId?: number | null;
  handleClose: () => void;
}> = ({ refreshData, eventId, handleClose }) => {
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

  const [initialEventData, setInitialEventData] = React.useState<FormData>({
    name: "",
    location: "",
    description: "",
    capacity: null,
    points: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity" || name === "points"
          ? Number(value)
          : name === "startTime" || name === "endTime"
          ? new Date(value)
          : value,
    }));
  };

  const formValidation = () => {
    const { name, location, startTime, endTime, description, points } =
      formData;
    return (
      name &&
      location &&
      startTime &&
      endTime &&
      description &&
      startTime < endTime &&
      points > 0
    );
  };

  const handleSubmit = async () => {
    if (!formValidation()) {
      return;
    }

    if (eventId) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
   
  };

  const handleCreate = async () => {
    const response = await api.post("/events", {
      ...formData,
      startTime: formData.startTime?.toISOString(),
      endTime: formData.endTime?.toISOString(),
    });

    if (response.status === 201) {
      createNotification({
        type: "success",
        message: "Event created successfully",
      });
      setFormData({
        name: "",
        location: "",
        description: "",
        capacity: null,
        points: 0,
      });
      handleClose();
      refreshData();
    } else {
      createNotification({
        type: "error",
        message: "Failed to create event",
      });
    } 
  }

  const handleUpdate = async () => {
    
    const response = await api.patch(`/events/${eventId}`, {
      ...Object.fromEntries(
        Object.entries(formData).filter(
          ([key, value]) => {
            const normalizeDate = (date: Date | undefined) =>
              date ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()) : undefined;
            if (key === "startTime" || key === "endTime") {  
              return normalizeDate(value as Date) !== normalizeDate((initialEventData as any)[key]);
            }
           return  value !== (initialEventData as any)[key]
          }
        )
      )
    });
    if (response.status === 200) {
      createNotification({
        type: "success",
        message: "Event updated successfully",
      });
      setFormData({
        name: "",
        location: "",
        description: "",
        capacity: null,
        points: 0,
      });
      handleClose();
      refreshData();
    } else {
      createNotification({
        type: "error",
        message: "Failed to update event",
      });
    }
  };

  const fetchEventById = async (eventId: number) => {
    const response = await api.get(`/events/${eventId}`);
    if (response.status === 200) {
      const event = response.data;
      setInitialEventData({
        name: event.name,
        location: event.location,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        description: event.description,
        capacity: event.capacity,
        points: event.pointsAwarded + event.pointsRemain,
      });
      setFormData({
        name: event.name,
        location: event.location,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        description: event.description,
        capacity: event.capacity,
        points: event.pointsAwarded + event.pointsRemain,
      });
    } else {
      createNotification({
        type: "error",
        message: "Failed to fetch event data",
      });
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
    }
  }, [eventId]);

  return (
    <>
      <div className="py-4">
        <form className="space-y-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Event name</legend>
            <input
              type="text"
              className="input"
              placeholder="Type here"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Location</legend>
            <input
              type="text"
              className="input"
              placeholder="Event Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Start Time</legend>
            <input
              type="datetime-local"
              className="input"
              name="startTime"
              value={
                formData.startTime
                  ? formatDateTimeAsISO(formData.startTime)
                  : ""
              }
              onChange={handleChange}
              required
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">End Time</legend>
            <input
              type="datetime-local"
              className="input"
              name="endTime"
              value={
                formData.endTime ? formatDateTimeAsISO(formData.endTime) : ""
              }
              onChange={handleChange}
              required
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Description</legend>
            <textarea
              className="textarea"
              placeholder="Event Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Capacity</legend>
            <input
              type="number"
              className="input"
              placeholder="Event Capacity"
              name="capacity"
              min={0}
              value={formData.capacity || ""}
              onChange={handleChange}
            />
            <p className="fieldset-label">Optional</p>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Points</legend>
            <input
              type="number"
              className="input"
              placeholder="Event Points"
              name="points"
              value={formData.points || ""}
              onChange={handleChange}
              min={0}
              required
            />
          </fieldset>
        </form>
      </div>

      <div className="modal-action">
        <form method="dialog">
          <button
            className="btn mr-2 btn-primary"
            disabled={!formValidation()}
            onClick={handleSubmit}
          >
            {eventId ? "Update Event" : "Create Event"}
          </button>
          <button className="btn" onClick={handleClose}>
            Close
          </button>
        </form>
      </div>
    </>
  );
};

import React, { useEffect } from "react";
import { useNotification } from "../../context/NotificationContext";
import { api } from "../../config/api";
import { AxiosError } from "axios";
import { useAuth } from "../../context/AuthContext";
import { useEvent } from "../../context/EventContext";
const formatDateTimeAsISO = (date: Date) => {
  const padToTwoDigits = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${padToTwoDigits(
    date.getMonth() + 1
  )}-${padToTwoDigits(date.getDate())}T${padToTwoDigits(
    date.getHours()
  )}:${padToTwoDigits(date.getMinutes())}`;
};

export const EventForm: React.FC<{
  eventId?: number | null;
  handleClose: () => void;
}> = ({ eventId, handleClose }) => {
  const { role} = useAuth()
  const {refreshEvents} = useEvent()
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

  const hasEventStarted = initialEventData.startTime  && initialEventData.startTime < new Date();
  // const hasEventEnded = initialEventData.endTime && initialEventData.endTime < new Date();
  const isManager = role === "manager"

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
      refreshEvents();
    } else {
      createNotification({
        type: "error",
        message: "Failed to create event",
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await api.patch(`/events/${eventId}`, {
        ...Object.fromEntries(
          Object.entries(formData).filter(([key, value]) => {
            if (key === "startTime" || key === "endTime") {
              const initialDate = (initialEventData as any)[key] as
                | Date
                | undefined;
              const currentDate = value as Date | undefined;
              return initialDate?.toISOString() !== currentDate?.toISOString();
            }
            return value !== (initialEventData as any)[key];
          })
        ),
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
        refreshEvents();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        createNotification({
          type: "error",
          message: error.response?.data.error || "Failed to update event",
        });
      } else {
        createNotification({
          type: "error",
          message: "Failed to update event",
        });
      }
    } finally {
      handleClose();
    }
  };

  const fetchEventById = async (eventId: number) => {
    const response = await api.get(`/events/${eventId}`);
    if (response.status === 200) {
      const event = response.data;
      const initialStartTime = new Date(event.startTime);
      const initialEndTime = new Date(event.endTime);
      initialEndTime.setSeconds(0);
      initialEndTime.setMilliseconds(0);
      initialStartTime.setSeconds(0);
      initialStartTime.setMilliseconds(0);
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
          <fieldset className={`fieldset ${hasEventStarted ? 'tooltip' : ''}`} data-tip="Event has already started">
            <legend className="fieldset-legend">Event name</legend>
            <input
              type="text"
              className="input"
              placeholder="Type here"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={hasEventStarted}
              required
            />
          </fieldset>
          <fieldset className={`fieldset ${hasEventStarted ? 'tooltip' : ''}`} data-tip="Event has already started">
            <legend className="fieldset-legend">Location</legend>
            <input
              type="text"
              className="input"
              placeholder="Event Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={hasEventStarted}
              required
            />
          </fieldset>
          <fieldset className={`fieldset ${hasEventStarted ? 'tooltip' : ''}`} data-tip="Event has already started">
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
              disabled={hasEventStarted}
              required
            />
          </fieldset>
          <fieldset className={`fieldset ${hasEventStarted ? 'tooltip' : ''}`} data-tip="Event has already started">
            <legend className="fieldset-legend">End Time</legend>
            <input
              type="datetime-local"
              className="input"
              name="endTime"
              value={
                formData.endTime ? formatDateTimeAsISO(formData.endTime) : ""
              }
              onChange={handleChange}
              disabled={hasEventStarted}
              required
            />
          </fieldset>
          <fieldset className={`fieldset ${hasEventStarted ? 'tooltip' : ''}`} data-tip="Event has already started">
            <legend className="fieldset-legend">Description</legend>
            <textarea
              className="textarea"
              placeholder="Event Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={hasEventStarted}
              required
            ></textarea>
          </fieldset>
          <fieldset className={`fieldset ${hasEventStarted ? 'tooltip' : ''}`} data-tip="Event has already started">
            <legend className="fieldset-legend">Capacity</legend>
            <input
              type="number"
              className="input"
              placeholder="Event Capacity"
              name="capacity"
              min={0}
              value={formData.capacity || ""}
              disabled={hasEventStarted}
              onChange={handleChange}
            />
            <p className="fieldset-label">Optional</p>
          </fieldset>
          <fieldset className={`fieldset ${!isManager && eventId ? 'tooltip' : ''}`} data-tip="Only managers can edit points">
            <legend className="fieldset-legend">Points</legend>
            <input
              type="number"
              className="input"
              placeholder="Event Points"
              name="points"
              value={formData.points || ""}
              onChange={handleChange}
              disabled={!isManager && !!eventId}
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

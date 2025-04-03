import React, { useRef } from "react";
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

export const CreateEventModal: React.FC = () => {
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
    // TODO
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
    } else {
      createNotification({
        type: "error",
        message: "Failed to create event",
      });
    }
  };

  return (
    <>
      <div className="drawer drawer-end">
        <input
          id="my-drawer-4"
          type="checkbox"
          ref={modalCheckboxRef}
          className="drawer-toggle"
        />
        <div className="drawer-content">
          {/* Page content here */}
          <label
            htmlFor="my-drawer-4"
            className="drawer-button btn btn-primary"
          >
            Open drawer
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-base-200 text-base-content min-h-full z-10 w-80 p-4">
            {/* Sidebar content here */}
            <h3 className="font-bold text-lg">Create new event</h3>
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
                      formData.endTime
                        ? formatDateTimeAsISO(formData.endTime)
                        : ""
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
                  Create
                </button>
                <button className="btn">Close</button>
              </form>
            </div>
          </ul>
        </div>
      </div>
      
    </>
  );
};

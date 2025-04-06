import { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../config/api";
import { useNotification } from "../../context/NotificationContext";
import { EventDetailsType } from "../../pages/EventDetails";

export const EventOrganizers: React.FC<{
  eventDetails: EventDetailsType;
  refreshEventDetails: () => Promise<void>;
}> = ({ eventDetails, refreshEventDetails }) => {
  const { id: eventId } = useParams<{ id: string }>();
  const { createNotification } = useNotification();
  const assignModalRef = useRef<HTMLDialogElement>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [selectedUserUtorId, setSelectedUserUtorId] = useState<string | null>(
    null
  );

  const getAllUsers = async () => {
    const response = await api.get("/users", { params: { limit: 1000 } });
    setAllUsers(response.data.results);
  };

  const handleOpenAssignModal = () => {
    if (assignModalRef.current) {
      assignModalRef.current.showModal();
    }
  };
  const handleCloseAssignModal = () => {
    if (assignModalRef.current) {
      assignModalRef.current.close();
    }
  };

  const handleUnassignOrganizer = async (userId: number) => {
    if (!eventId) return;
    try {
      const response = await api.delete(
        `/events/${eventId}/organizers/${userId}`
      );
      if (response.status === 204) {
        await refreshEventDetails();
        createNotification({
          type: "success",
          message: `Organizer ${userId} removed successfully.`,
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        createNotification({
          type: "error",
          message: error.response?.data.error || "Error removing organizer",
        });
      } else {
        createNotification({
          type: "error",
          message: `Error removing organizer: ${error}`,
        });
      }
    }
  };

  const handleAssignOrganizer = async () => {
    if (!selectedUserUtorId || !eventId) return;
    try {
      const response = await api.post(`/events/${eventId}/organizers`, {
        utorid: selectedUserUtorId,
      });
      if (response.status === 201) {
        await refreshEventDetails();
        handleCloseAssignModal();
        createNotification({
          type: "success",
          message: `Organizer ${selectedUserUtorId} added successfully.`,
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        createNotification({
          type: "error",
          message: error.response?.data.error || "Error assigning organizer",
        });
      } else {
        createNotification({
          type: "error",
          message: `Error assigning organizer: ${error}`,
        });
      }
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog ref={assignModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Assign new organizer for {eventDetails.name}
          </h3>
          <p className="py-4">
            <select
              defaultValue="Select a user"
              className="select"
              onChange={(e) => {
                setSelectedUserUtorId(e.target.value);
              }}
            >
              <option disabled={true}>Select a user</option>
              {allUsers.map((user) => (
                <option
                  key={user.id}
                  value={user.utorid}
                  onSelect={() => {
                    setSelectedUserUtorId(user.utorid);
                  }}
                >
                  {user.name}
                </option>
              ))}
            </select>
          </p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn" onClick={handleAssignOrganizer}>
                Yes
              </button>
              <button className="btn" onClick={handleCloseAssignModal}>
                No
              </button>
            </form>
          </div>
        </div>
      </dialog>

      <ul className="list bg-base-200 rounded-box shadow-md">
        <li className="p-4 pb-2 tracking-wide flex justify-between items-center">
          <p className="text-lg">Organizers</p>
          <button
            className="btn btn-primary btn-sm"
            disabled={
              !eventDetails.published ||
              new Date(eventDetails.endTime) < new Date()
            }
            onClick={() => handleOpenAssignModal()}
          >
            Add Organizer
          </button>
        </li>

        {eventDetails.organizers.length === 0 ? (
          <li className="list-row">
            <div>
              <div className="avatar avatar-placeholder">
                <div className="bg-neutral text-neutral-content w-12 rounded-full">
                  <span>NA</span>
                </div>
              </div>
            </div>
            <div>
              <div>No Organizers</div>
              <div className="text-xs uppercase font-semibold opacity-60">
                Start adding organizers
              </div>
            </div>
          </li>
        ) : (
          <>
            {eventDetails?.organizers.map((organizer) => (
              <li className="list-row" key={organizer.id}>
                <div>
                  <div className="avatar avatar-placeholder">
                    <div className="bg-neutral text-neutral-content w-12 rounded-full">
                      <span>{organizer.name.charAt(0)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div>{organizer.name}</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    {organizer.utorid}
                  </div>
                </div>
                <button
                  className="btn btn-square btn-ghost"
                  onClick={() => handleUnassignOrganizer(organizer.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </>
        )}
      </ul>
    </>
  );
};

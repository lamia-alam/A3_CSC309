import { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../config/api";
import { useNotification } from "../../context/NotificationContext";
import { EventDetailsType } from "../../pages/EventDetails";

export const EventGuests: React.FC<{
    eventDetails: EventDetailsType;
    refreshEventDetails: () => Promise<void>;
  }> = ({ eventDetails, refreshEventDetails }) => {
  const { id: eventId } = useParams<{ id: string }>();
  const { createNotification } = useNotification();
  const unassignModalRef = useRef<HTMLDialogElement>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);


  const [selectedUserUtorId, setSelectedUserUtorId] = useState<string | null>(
    null
  );

  const getAllUsers = async () => {
    const response = await api.get("/users", { params: { limit: 1000 } });
    setAllUsers(response.data.results);
  };

  const handleOpenUnassignModal = () => {
    if (unassignModalRef.current) {
      unassignModalRef.current.showModal();
    }
  };
  const handleCloseUnassignModal = () => {
    if (unassignModalRef.current) {
      unassignModalRef.current.close();
    }
  };

  const handleRemoveGuest = async (userId: number) => {
    if (!eventId) return;
    try {
      const response = await api.delete(`/events/${eventId}/guests/${userId}`);
      if (response.status === 204) {
        await refreshEventDetails();
        createNotification({
          type: "success",
          message: `Guest ${userId} removed successfully.`,
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        createNotification({
          type: "error",
          message: error.response?.data.error || "Error removing guest",
        });
      } else {
        createNotification({
          type: "error",
          message: `Error removing guest: ${error}`,
        });
      }
    }
  };

  const handleAddGuests = async () => {
    if (!selectedUserUtorId || !eventId) return;
    try {
      const response = await api.post(`/events/${eventId}/guests`, {
        utorid: selectedUserUtorId,
      });
      if (response.status === 201) {
        await refreshEventDetails();
        handleCloseUnassignModal();
        createNotification({
          type: "success",
          message: `Guest ${selectedUserUtorId} added successfully.`,
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        createNotification({
          type: "error",
          message: error.response?.data.error || "Error adding guest",
        });
      } else {
        createNotification({
          type: "error",
          message: `Error adding guest: ${error}`,
        });
      }
    }
  };

 

  useEffect(() => {
    getAllUsers();
  }, []);

  if (eventDetails === null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog ref={unassignModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Assign new guests for {eventDetails.name}
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
              <button className="btn" onClick={handleAddGuests}>
                Yes
              </button>
              <button className="btn" onClick={handleCloseUnassignModal}>
                No
              </button>
            </form>
          </div>
        </div>
      </dialog>

      <ul className="list bg-base-200 rounded-box shadow-md">
        <li className="p-4 pb-2 tracking-wide flex justify-between items-center">
          <p className="text-lg">Guests</p>
          <button
            className="btn btn-primary btn-sm"
            disabled={
              !eventDetails.published ||
              new Date(eventDetails.endTime) < new Date()
            }
            onClick={() => handleOpenUnassignModal()}
          >
            Add Guests
          </button>
        </li>

        {eventDetails.guests.length === 0 ? (
          <li className="list-row">
          <div>
            <div className="avatar avatar-placeholder">
              <div className="bg-neutral text-neutral-content w-12 rounded-full">
                <span>NA</span>
              </div>
            </div>
          </div>
          <div>
            <div>No Guests</div>
            <div className="text-xs uppercase font-semibold opacity-60">
              Start adding guests
            </div>
          </div>
          </li>
        ) : (
          <>
            {eventDetails.guests.map((guest) => (
              <li className="list-row" key={guest.id}>
                <div>
                  <div className="avatar avatar-placeholder">
                    <div className="bg-neutral text-neutral-content w-12 rounded-full">
                      <span>{guest.name.charAt(0)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div>{guest.name}</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    {guest.utorid}
                  </div>
                </div>
                <button
                  className="btn btn-square btn-ghost"
                  onClick={() => handleRemoveGuest(guest.id)}
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

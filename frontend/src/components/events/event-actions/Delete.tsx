import React, { useRef } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import { api } from "../../../config/api";
import { useNotification } from "../../../context/NotificationContext";
import { AxiosError } from "axios";
import { useEvent } from "../../../context/EventContext";
import { EventType } from "../EventTable";

export const DeleteEvent: React.FC<{
  params: ICellRendererParams<EventType>;
}> = ({ params }) => {
  const {createNotification} =  useNotification()
  const {refreshEvents} = useEvent()

  const deleteModalRef = useRef<HTMLDialogElement>(null);

  const handleOpenDeleteModal = () => {
    if (deleteModalRef.current) {
      deleteModalRef.current.showModal();
    }
  };
  const handleCloseDeleteModal = () => {
    if (deleteModalRef.current) {
      deleteModalRef.current.close();
    }
  }

  const handleDeleteEvent = async () => {
    try {
      if (!params.data || !params.data.id) {
        return;
      }
        const response = await api.delete('/events/' + params.data.id);
        if (response.status === 204) {
          createNotification({
            type: "success",
            message: "Event deleted successfully",
          });
          handleCloseDeleteModal();
          refreshEvents();
        }
    } catch (error) {
        if (error instanceof AxiosError) {
          createNotification({
            type: "error",
            message: error.response?.data.error || "Something went wrong",
          });
        }
    } 
  }

  if (
    params.data &&
    !params.data.published
  ) {
    return (
      <>
      <button
        className="btn btn-square btn-xs"
        onClick={() => handleOpenDeleteModal()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      </button>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog ref={deleteModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Are you sure you want to delete {params.data.name}?</h3>
          {/* <p className="py-4"></p> */}
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn" onClick={handleDeleteEvent}>Yes</button>
              <button className="btn" onClick={handleCloseDeleteModal} >No</button>
            </form>
          </div>
        </div>
      </dialog>

      </>
    );
  }
};

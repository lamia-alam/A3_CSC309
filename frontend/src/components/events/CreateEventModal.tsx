import React, { useRef } from "react";
import { EventForm } from "./EventForm";

export const CreateEventModal: React.FC<{
  refreshData: () => void;
}> = ({ refreshData }) => {
  const modalCheckboxRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    modalCheckboxRef.current!.checked = false;
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
        <div className="drawer-side z-10">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-base-200 text-base-content min-h-full w-96 p-4">
            {/* Sidebar content here */}
            <h3 className="font-bold text-lg">Create new event</h3>
            <EventForm refreshData={refreshData} handleClose={handleClose} />
          </ul>
        </div>
      </div>
    </>
  );
};

import React from "react";
import { EditEventDrawer } from "../components/events/EditEventDrawer";
import { CreateEventDrawer } from "../components/events/CreateEventDrawer";
import { EventTable } from "../components/events/EventTable";
import { EventProvider } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";

export const Events: React.FC = () => {
  const { role } = useAuth();

  return (
    <EventProvider url="/events">
      {role && (role === "manager" || role === "superuser") ? (
        <>
          <label
            htmlFor="my-drawer-4"
            className="drawer-button btn btn-primary float-right"
          >
            Create Event
          </label>
          <EditEventDrawer />
          <CreateEventDrawer />
        </>
      ) : null}
      <EventTable />
    </EventProvider>
  );
};

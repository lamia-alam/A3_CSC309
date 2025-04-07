import React from "react";
import { EditEventDrawer } from "../components/events/EditEventDrawer";
import { CreateEventDrawer } from "../components/events/CreateEventDrawer";
import { EventTable } from "../components/events/EventTable";
import { EventProvider } from "../context/EventContext";


export const Events: React.FC = () => {

  return (
    <EventProvider>
      <label
        htmlFor="my-drawer-4"
        className="drawer-button btn btn-primary float-right"
      >
        Create Event
      </label>

      <EditEventDrawer
       
      />
      <CreateEventDrawer />
      <EventTable />
     
    </EventProvider>
  );
};

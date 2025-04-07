import React from "react";
import { EditEventDrawer } from "../components/events/EditEventDrawer";
import { EventTable } from "../components/events/EventTable";
import { EventProvider } from "../context/EventContext";

export const MyEvents: React.FC = () => {
  return (
    <EventProvider url={"/events/me"}>
      <EditEventDrawer />
      <EventTable />
    </EventProvider>
  );
};

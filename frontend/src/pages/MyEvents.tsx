import React from "react";
import { EditEventDrawer } from "../components/events/EditEventDrawer";
import { EventTable } from "../components/events/EventTable";
import { EventProvider } from "../context/EventContext";
import { MyEventProvider } from "../context/MyEventContext";

export const MyEvents: React.FC = () => {
  return (
    <MyEventProvider>
      <EditEventDrawer />
      <EventTable />
    </MyEventProvider>
  );
};

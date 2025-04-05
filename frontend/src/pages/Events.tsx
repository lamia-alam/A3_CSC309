import React, { useEffect, useMemo, useState } from "react";
import { api } from "../config/api";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  ICellRendererParams,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
} from "ag-grid-community";
import { useAuth } from "../context/AuthContext";
import { EditEventDrawer } from "../components/events/EditEventDrawer";
import { EventActionsWrapper } from "../components/events/event-actions/EventActionsWrapper";
import { CreateEventDrawer } from "../components/events/CreateEventDrawer";
import { EventTable } from "../components/events/EventTable";
import { EventProvider, useEvent } from "../context/EventContext";

export type EventType = {
  id: number;
  name: string;
  location: string;
  startTime: string;
  endTime: string;
  numGuests: number;
  pointsAwarded: number;
  pointsRemain: number;
  published: boolean;
  capacity: number | null;
};

export const Events: React.FC = () => {
  const { userInfo } = useAuth();

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

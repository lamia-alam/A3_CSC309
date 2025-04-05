import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  ICellRendererParams,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
} from "ag-grid-community";
import { useAuth } from "../../context/AuthContext";
import { EditEventDrawer } from "../../components/events/EditEventDrawer";
import { EventActionsWrapper } from "../../components/events/event-actions/EventActionsWrapper";
import { CreateEventDrawer } from "../../components/events/CreateEventDrawer";
import { useEvent } from "../../context/EventContext";

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

export const EventTable: React.FC = () => {
  const { userInfo } = useAuth();
  const {
    events,
    refreshEvents: fetchEvents,
    pageSize,
    page,
    pageCount,
    handlePageSizeChange,
    handlePageChange,
  } = useEvent();

  const [selectEventId, setSelectEventId] = useState<number | null>(null);

  const [colDefs] = useState<ColDef<EventType>[]>([
    {
      headerName: "Name",
      lockPinned: true,
      pinned: true,
      cellRenderer: (params: ICellRendererParams) => {
        return (
          <div className="flex items-center">
            <span onClick={() => setSelectEventId(params.data.id)}>
              {params.data.name}
            </span>
            {params.data.published && (
              <span className="badge badge-sm badge-success ml-2"></span>
            )}
          </div>
        );
      },
    },
    { field: "location", headerName: "Location", width: 150 },
    { field: "numGuests", headerName: "# Guests", width: 150 },
    {
      field: "startTime",
      headerName: "Start Time",
      minWidth: 180,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleString();
      },
    },
    {
      field: "endTime",
      headerName: "End Time",
      minWidth: 180,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleString();
      },
    },
    {
      headerName: "Points awarded",
      field: "pointsAwarded",
      minWidth: 100,
    },
    {
      headerName: "Points remaining",
      field: "pointsRemain",
      minWidth: 100,
      hide: userInfo?.role === "regular" || userInfo?.role === "cashier",
    },
    { field: "capacity", headerName: "Capacity", width: 150 },
    {
      headerName: "Action",
      pinned: "right",
      cellRenderer: (params: ICellRendererParams) => (
        <EventActionsWrapper
          params={params}
        />
      ),
    },
  ]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      // sortable: true,
      // filter: true,
      resizable: false,
      // flex: 1,
      minWidth: 100,
    };
  }, []);

  const autoSizeStrategy = useMemo<
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy
  >(() => {
    return {
      type: "fitCellContents",
    };
  }, []);

  return (
    <>
      <div className="w-full h-2/3 mt-4">
        <AgGridReact
          autoSizeStrategy={autoSizeStrategy}
          rowData={events}
          columnDefs={colDefs}
          rowHeight={40}
          headerHeight={40}
          domLayout="autoHeight"
          defaultColDef={defaultColDef}
        />
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2 justify-start">
          <div className="join">
            <button className="join-item btn">Show per page</button>
            {[5, 10, 15, 20].map((size) => (
              <input
                key={size}
                className="join-item btn btn-square"
                type="radio"
                name="pageSize"
                aria-label={size.toString()}
                checked={pageSize === size}
                onChange={() => handlePageSizeChange(size)}
              />
            ))}
          </div>
        </div>
        <div className="join">
          <button className="join-item btn">Page</button>

          {pageCount > 1 &&
            Array.from({ length: pageCount }, (_, index) => (
              <input
                className="join-item btn btn-square"
                type="radio"
                name="pageNumber"
                aria-label={`${index + 1}`}
                key={index}
                onChange={() => handlePageChange(index + 1)}
                checked={page === index + 1}
              />
            ))}
        </div>
      </div>
    </>
  );
};

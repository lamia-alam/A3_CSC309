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
import { EventActions } from "../components/events/EventActions";
import { useAuth } from "../context/AuthContext";
import { CreateEventModal } from "../components/events/CreateEventModal";

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
  const {userInfo} = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

  const [colDefs] = useState<ColDef<EventType>[]>([
    {
      headerName: "Name",
      lockPinned: true,
      pinned: true,
      cellRenderer: (params: ICellRendererParams) => {
        return (
          <div className="flex items-center">
            <span>{params.data.name}</span>
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
      hide: userInfo?.role === 'regular' || userInfo?.role === 'cashier',
    },
    { field: "capacity", headerName: "Capacity", width: 150 },
    {
      headerName: "Action",
      pinned: "right",
      cellRenderer: (params: ICellRendererParams) => (
        <EventActions params={params} refreshData={fetchEvents} />
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

  const fetchEvents = async () => {
    const response = await api.get("/events");
    setEvents(response.data.results);
  };

  const autoSizeStrategy = useMemo<
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy
  >(() => {
    return {
      type: "fitCellContents",
    };
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <>
      <div className="w-full h-2/3">
        <AgGridReact
          autoSizeStrategy={autoSizeStrategy}
          suppressRowTransform={true}
          rowData={events}
          columnDefs={colDefs}
          rowHeight={40}
          headerHeight={40}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
          defaultColDef={defaultColDef}
        />
      </div>
      <CreateEventModal />
    </>
  );

  // return (
  //   <>
  //     <div>Events</div>
  //     <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
  //       <table className="table">
  //         {/* head */}
  //         <thead>
  //           <tr>
  //             <th>ID</th>
  //             <th>Name</th>
  //             <th>Location</th>
  //             <th># Guests</th>
  //             <th>Start Time</th>
  //             <th>End Time</th>
  //             <th>Points</th>
  //             <th>Published</th>
  //             <th>Capacity</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {/* row 1 */}
  //           {events.map((event) => (
  //             <tr key={event.id}>
  //               <th>{event.id}</th>
  //               <td>{event.name} {event.published && <span className="badge badge-success">Published</span>}</td>
  //               <td>{event.location}</td>
  //               <td>{event.numGuests}</td>
  //               <td>{new Date(event.startTime).toLocaleString()}</td>
  //               <td>{new Date(event.endTime).toLocaleString()}</td>
  //               <td>{event.pointsAwarded}</td>
  //               <td>{event.published ? "Yes" : "No"}</td>
  //               <td>{event.capacity ? event.capacity : "N/A"}</td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </div>
  //   </>
  // );
};

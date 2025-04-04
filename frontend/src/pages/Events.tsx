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
import { EditEventDrawer } from "../components/events/EditEventDrawer";

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
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
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
        <EventActions
          params={params}
          refreshData={fetchEvents}
          setSelectEventId={setSelectEventId}
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

  const fetchEvents = async () => {
    const response = await api.get("/events", {
      params: {
        page,
        limit: pageSize,
      },
    });
    setEvents(response.data.results);
    setTotalItems(response.data.count);
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

  const pageCount = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchEvents();
  }, [page, pageSize]);

  return (
    <>
      <label
        htmlFor="my-drawer-4"
        className="drawer-button btn btn-primary float-right"
      >
        Create Event
      </label>
      
      <EditEventDrawer 
        eventId={selectEventId}
        setSelectEventId={setSelectEventId}
        refreshData={fetchEvents}
        />
      <CreateEventModal
        refreshData={fetchEvents}
      />
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
          {/* <input
          className="join-item btn btn-square"
          type="radio"
          name="options"
          aria-label="1"
          checked
        />
        <input
          className="join-item btn btn-square"
          type="radio"
          name="options"
          aria-label="2"
        />
        <input
          className="join-item btn btn-square"
          type="radio"
          name="options"
          aria-label="3"
        />
        <input
          className="join-item btn btn-square"
          type="radio"
          name="options"
          aria-label="4"
        /> */}
        </div>
      </div>

      {/* <div className="flex justify-between items-center mt-4">
        <div>
          <span>
            Page {page} of {Math.ceil(totalItems / pageSize)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="mr-2">
            Page Size:
          </label>
          <select
            id="pageSize"
            className="select select-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm"
            disabled={page === 1}
            onClick={() => {
              setPage((prev) => Math.max(prev - 1, 1));
            }}
          >
            Previous
          </button>
          <button
            className="btn btn-sm"
            disabled={page === Math.ceil(totalItems / pageSize)}
            onClick={() => {
              setPage((prev) =>
                Math.min(prev + 1, Math.ceil(totalItems / pageSize))
              );
            }}
          >
            Next
          </button>
        </div>
      </div> */}
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

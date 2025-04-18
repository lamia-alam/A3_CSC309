import { ColDef, ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import { Link } from "react-router-dom";
import { EventActionsWrapper } from "./event-actions/EventActionsWrapper";
import { EventType } from "./EventTable";
import { UserInfo } from "../../context/AuthContext";

export const defaultColDef: ColDef<EventType> = {
  resizable: false,
      minWidth: 100,
} 

export const getEventColDefs = (role: UserInfo['role'] | null): ColDef<EventType>[] => [
    {
      headerName: "Name",
      lockPinned: true,
      resizable: true,
      pinned: true,
      cellRenderer: (params: ICellRendererParams) => {
        return (
          <div className="flex items-center gap-2">
            <Link to={`/events/${params.data.id}`}>
              {params.data.name}
            </Link>
            {params.data.published && (
              <div aria-label="success" className="status status-success"></div>
            )}
          </div>
        );
      },
    },
    { field: "location", headerName: "Location", width: 150 },
    { field: "description", headerName: "Description", minWidth: 200 },
    { field: "numGuests", headerName: "# Guests", width: 150 },
    {
      field: "startTime",
      headerName: "Start Time",
      minWidth: 180,
      valueFormatter: (params: ValueFormatterParams) => {
        const date = new Date(params.value);
        return date.toLocaleString();
      },
    },
    {
      field: "endTime",
      headerName: "End Time",
      minWidth: 180,
      valueFormatter: (params: ValueFormatterParams) => {
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
      hide: !role || role === "regular" || role === "cashier",
    },
    { field: "capacity", headerName: "Capacity", width: 150 },
    {
      headerName: "Action",
      pinned: "right",
      resizable: true,
      cellRenderer: (params: ICellRendererParams) => (
        <EventActionsWrapper
          params={params}
        />
      ),
    },
  ];
  
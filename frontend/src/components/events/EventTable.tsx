import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
} from "ag-grid-community";
import { useAuth } from "../../context/AuthContext";
import { useEvent } from "../../context/EventContext";
import { defaultColDef, getEventColDefs } from "./eventTableUtils";

export type EventType = {
  id: number;
  name: string;
  location: string;
  description: string;
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
    pageSize,
    page,
    pageCount,
    handlePageSizeChange,
    handlePageChange,
  } = useEvent();


  const [colDefs] = useState<ColDef<EventType>[]>(getEventColDefs(userInfo));

 

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
          cellSelection={false}
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

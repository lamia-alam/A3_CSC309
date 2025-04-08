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
  const { role } = useAuth();
  const {
    events,
    pageSize,
    page,
    pageCount,
    handlePageSizeChange,
    handlePageChange,
    started,
    ended,
    published,
    showFull,
    setStarted,
    setEnded,
    setPublished,
    setShowFull,
    filterLocation,
    filterName,
    setFilterLocation,
    setFilterName,
  } = useEvent();

  const [colDefs] = useState<ColDef<EventType>[]>(getEventColDefs(role));

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
      {/* Filters */}
      <div className="flex justify-start items-center gap-x-12 gap-y-4 my-4 flex-wrap">
        <label className="input">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input
            type="search"
            className="grow"
            placeholder="Search Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </label>

        <label className="input">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-[1em] opacity-50"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>

          <input
            type="search"
            className="grow"
            placeholder="Search Location"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          />
        </label>

        <label className="fieldset-label">
          <input
            type="checkbox"
            className="checkbox"
            checked={showFull}
            onChange={(e) => setShowFull(e.target.checked)}
          />
          Show full
        </label>

        <form className="filter">
          <input
            className="btn btn-square"
            type="reset"
            value="×"
            onClick={() => {
              setStarted(null);
              setEnded(null);
            }}
          />
          <input
            className="btn"
            type="radio"
            name="status"
            aria-label="Started"
            checked={started ?? false}
            onChange={(e) => {
              setStarted(e.target.checked);
              setEnded(null);
            }}
          />
          <input
            className="btn"
            type="radio"
            name="status"
            aria-label="Ended"
            checked={ended ?? false}
            onChange={(e) => {
              setEnded(e.target.checked);
              setStarted(null);
            }}
          />
        </form>

        <form className="filter">
          <input
            className="btn btn-square"
            type="reset"
            value="×"
            onClick={() => {
              setPublished(null);
            }}
          />
          <input
            className="btn"
            type="radio"
            name="publish"
            aria-label="Published"
            checked={published ?? false}
            onChange={(e) => {
              setPublished(e.target.checked);
            }}
          />
          <input
            className="btn"
            type="radio"
            name="publish"
            aria-label="Unpublished"
            checked={published === false}
            onChange={(e) => {
              setPublished(!e.target.checked);
            }}
          />
        </form>
      </div>

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

      {/* Pagination */}
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

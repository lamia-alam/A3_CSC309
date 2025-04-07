// import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
// import { api } from "../config/api";
// import { EventType } from "../components/events/EventTable";

// type EventContextType = {
//   events: EventType[];
//   refreshEvents: () => void;
//   handlePageSizeChange: (size: number) => void;
//   handlePageChange: (newPage: number) => void;
//   pageCount: number;
//   page: number;
//   pageSize: number;
//   selectEventId: number | null;
//   setSelectEventId: (id: number | null) => void;
// };

// const EventContext = createContext<EventContextType>({
//     events: [],
//     refreshEvents: () => {},
//     handlePageSizeChange: () => {},
//     handlePageChange: () => {},
//     pageCount: 0,
//     page: 1,
//     pageSize: 5,
//     selectEventId: null,
//     setSelectEventId: () => {},
// });

// export const MyEventProvider: React.FC<PropsWithChildren> = ({ children }) => {
//   const [events, setEvents] = useState<EventType[]>([]);
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(5);
//   const [totalItems, setTotalItems] = useState(0);
//   const [selectEventId, setSelectEventId] = useState<number | null>(null);

//   const refreshEvents = async () => {
//     const response = await api.get("/events/me", {
//       params: {
//         page,
//         limit: pageSize,
//       },
//     });
//     setEvents(response.data.results);
//     setTotalItems(response.data.count);
//   };


//   const pageCount = useMemo(() => {
//     return Math.ceil(totalItems / pageSize);
//   }, [totalItems, pageSize]);

//   const handlePageSizeChange = (size: number) => {
//     setPageSize(size);
//     setPage(1);
//   };

//   const handlePageChange = (newPage: number) => {
//     setPage(newPage);
//   };

//   useEffect(() => {
//     refreshEvents();
//   }, [page, pageSize]);


//   return (
//     <EventContext.Provider value={{ events, refreshEvents, handlePageSizeChange, handlePageChange, pageCount, page, pageSize, selectEventId, setSelectEventId }}>
//       {children}
//     </EventContext.Provider>
//   );
// };

// export const useMyEvent = () => useContext(EventContext)
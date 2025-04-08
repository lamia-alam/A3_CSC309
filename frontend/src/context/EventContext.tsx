import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../config/api";
import { EventType } from "../components/events/EventTable";
import { useAuth, UserInfo } from "./AuthContext";

type EventContextType = {
  events: EventType[];
  refreshEvents: () => void;
  handlePageSizeChange: (size: number) => void;
  handlePageChange: (newPage: number) => void;
  pageCount: number;
  page: number;
  pageSize: number;
  selectEventId: number | null;
  setSelectEventId: (id: number | null) => void;
  showFull: boolean;
  setShowFull: (show: boolean) => void;
  ended: boolean | null;
  setEnded: (ended: boolean | null) => void;
  started: boolean | null;
  setStarted: (started: boolean | null) => void;
  published: boolean | null;
  setPublished: (published: boolean | null) => void;
  filterName: string;
  setFilterName: (name: string) => void;
  filterLocation: string;
  setFilterLocation: (location: string) => void;
};

const EventContext = createContext<EventContextType>({
  events: [],
  refreshEvents: () => {},
  handlePageSizeChange: () => {},
  handlePageChange: () => {},
  pageCount: 0,
  page: 1,
  pageSize: 5,
  selectEventId: null,
  setSelectEventId: () => {},
  showFull: false,
  setShowFull: () => {},
  ended: null,
  setEnded: () => {},
  started: null,
  setStarted: () => {},
  published: null,
  setPublished: () => {},
  filterName: "",
  setFilterName: () => {},
  filterLocation: "",
  setFilterLocation: () => {},
});

export const EventProvider: React.FC<PropsWithChildren<{ url: string }>> = ({
  children,
  url,
}) => {
  const { role } = useAuth();
  const [events, setEvents] = useState<EventType[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [selectEventId, setSelectEventId] = useState<number | null>(null);

  const [showFull, setShowFull] = useState(false);
  const [ended, setEnded] = useState<boolean | null>(null);
  const [started, setStarted] = useState<boolean | null>(null);
  const [published, setPublished] = useState<boolean | null>(null);
  const [filterName, setFilterName] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const refreshEvents = async () => {
    const response = await api.get(url, {
      params: {
        page,
        limit: pageSize,
        showFull,
        ...(ended !== null && { ended }),
        ...(started !== null && { started }),
        ...(published !== null && { published }),
        ...(filterName && { name: filterName }),
        ...(filterLocation && { location: filterLocation }),
      },
    });
    if (
      url === "/events" &&
      (["cashier", "regular"] as (UserInfo["role"] | null)[]).includes(role)
    ) {
      setEvents(
        response.data.results.filter((event: EventType) => event.published)
      );
      setTotalItems(response.data.publishedCount);
    } else {
      setEvents(response.data.results);
      setTotalItems(response.data.count);
    }
  };

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
    refreshEvents();
  }, [page, pageSize, role, showFull, ended, started, published,
    filterName, filterLocation]);


  return (
    <EventContext.Provider
      value={{
        events,
        refreshEvents,
        handlePageSizeChange,
        handlePageChange,
        pageCount,
        page,
        pageSize,
        selectEventId,
        setSelectEventId,
        setShowFull,
        setEnded,
        setStarted,
        setPublished,
        showFull,
        ended,
        started,
        published,
        setFilterName,
        setFilterLocation,
        filterName,
        filterLocation,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);

import { useState, useMemo, useEffect } from "react";
import { EventType } from "../components/events/EventTable";
import { api } from "../config/api";

export const useEvents = ({ endpoint }: { endpoint: string }) => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [selectEventId, setSelectEventId] = useState<number | null>(null);

  const refreshEvents = async () => {
    const response = await api.get(endpoint, {
      params: {
        page,
        limit: pageSize,
      },
    });
    setEvents(response.data.results);
    setTotalItems(response.data.count);
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
  }, [page, pageSize]);

  return {
    events,
    page,
    pageSize,
    totalItems,
    selectEventId,
    setSelectEventId,
    pageCount,
    handlePageChange,
    handlePageSizeChange,
  };
};

import React, { PropsWithChildren } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import { EventType } from "../../pages/Events";
import { RSVPEvent } from "./RSVPEvent";
import { PublishEvent } from "./PublishEvent";
import { useAuth } from "../../context/AuthContext";
import { EditEventButton } from "./EditEventButton";

export const EventActions: React.FC<
  PropsWithChildren<{
    params: ICellRendererParams<EventType>;
    refreshData: () => void;
    setSelectEventId: React.Dispatch<React.SetStateAction<number | null>>;
  }>
> = ({ params, refreshData, setSelectEventId }) => {
  const { userInfo } = useAuth();
  if (!userInfo?.role) {
    return null;
  }
  return (
    <div className="flex gap-2 items-center p-2">
      <RSVPEvent params={params} refreshData={refreshData} />
      {userInfo.role === "manager" && (
        <PublishEvent params={params} refreshData={refreshData} />
      )}
      {["manager", "superuser"].includes(userInfo.role) && (
        <EditEventButton params={params} setSelectEventId={setSelectEventId} />
      )}
    </div>
  );
};

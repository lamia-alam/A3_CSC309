import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import { EventType } from "../../pages/Events";
import { AxiosError } from "axios";
import { api } from "../../config/api";
import { useNotification } from "../../context/NotificationContext";
import { RSVPEvent } from "./RSVPEvent";
import { PublishEvent } from "./PublishEvent";
import { useAuth } from "../../context/AuthContext";

export const EventActions: React.FC<{
  params: ICellRendererParams<EventType>;
  refreshData: () => void;
}> = ({ params, refreshData }) => {
  const { userInfo } = useAuth();
  return (
    <div className="flex gap-2 items-center p-2">
      <RSVPEvent params={params} refreshData={refreshData} />
      {userInfo?.role === "manager" && (
        <PublishEvent params={params} refreshData={refreshData} />
      )}
    </div>
  );
};

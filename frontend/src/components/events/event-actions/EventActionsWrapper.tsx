import React, { PropsWithChildren } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import { EventType } from "../../../pages/Events";
import { RSVPEvent } from "./RSVP";
import { PublishEvent } from "./Publish";
import { useAuth } from "../../../context/AuthContext";
import { EditEvent } from "./Edit";

export const EventActionsWrapper: React.FC<
  PropsWithChildren<{
    params: ICellRendererParams<EventType>;
  }>
> = ({ params }) => {
  
  const { userInfo } = useAuth();
  if (!userInfo?.role) {
    return null;
  }
  return (
    <div className="flex gap-2 items-center p-2">
      <RSVPEvent params={params}  />
      {userInfo.role === "manager" && (
        <PublishEvent params={params}  />
      )}
      {["manager", "superuser"].includes(userInfo.role) && (
        <EditEvent params={params} />
      )}
    </div>
  );
};

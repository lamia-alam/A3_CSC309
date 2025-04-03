import React, { PropsWithChildren, useContext } from "react";

type Notification = {
  id: number;
  message: string;
  type: "success" | "error";
};

type NotificationContextType = {
  createNotification: ({message, type}: {message: string, type: "success" | "error"}) => void;
};

const NotificationContext = React.createContext<NotificationContextType>({
  createNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const createNotification = ({message, type}:{message: string, type: "success" | "error"}) => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ createNotification }}>
      {children}
      <div className="relative bg-green-100">
        <div className="absolute bottom-2 right-2 flex flex-col gap-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              role="alert"
              className={` alert ${
                notification.type === "error" ? "alert-error" : "alert-success"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>{notification.message}</span>
            </div>
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

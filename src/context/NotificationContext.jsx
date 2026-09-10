import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { notificationService } from "../api/notificationService";

const NotificationContext = createContext(null);

function getRecordArray(response) {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.records)) {
    return response.records;
  }

  if (response.data && Array.isArray(response.data.records)) {
    return response.data.records;
  }

  return [];
}

function createNotification(record, type, index) {
  const id =
    record?.id ||
    record?.requestId ||
    record?.issueId ||
    record?.deploymentId ||
    `${type}-${index}`;

  const status = String(
    record?.status ||
      record?.state ||
      ""
  ).toLowerCase();

  let title = "";
  let message = "";

  switch (type) {
    case "deployment":
      title = "Deployment update";
      message =
        record?.project ||
        record?.application ||
        record?.name ||
        `Deployment ${id}`;

      break;

    case "access":
      title = "Access request";
      message =
        record?.project ||
        record?.application ||
        record?.name ||
        `Access request ${id}`;

      break;

    case "issue":
      title = "Issue update";
      message =
        record?.title ||
        record?.summary ||
        record?.name ||
        `Issue ${id}`;

      break;

    case "production":
      title = "Production issue";
      message =
        record?.title ||
        record?.summary ||
        record?.name ||
        `Production issue ${id}`;

      break;

    default:
      title = "OPSFlow notification";
      message = String(id);
  }

  let notificationType = "info";

  if (
    status.includes("fail") ||
    status.includes("error") ||
    status.includes("critical")
  ) {
    notificationType = "error";
  } else if (
    status.includes("success") ||
    status.includes("complete") ||
    status.includes("approved")
  ) {
    notificationType = "success";
  } else if (
    status.includes("pending") ||
    status.includes("open") ||
    status.includes("requested")
  ) {
    notificationType = "warning";
  }

  return {
    id: String(id),
    title,
    message,
    type: notificationType,
    createdAt:
      record?.createdAt ||
      record?.updatedAt ||
      record?.created_at ||
      new Date().toISOString(),
    read: false,
  };
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const result = await notificationService.getAll();

      const deploymentRecords = getRecordArray(result?.deployments);
      const accessRecords = getRecordArray(result?.access);
      const issueRecords = getRecordArray(result?.issues);
      const productionRecords = getRecordArray(
        result?.productionIssues
      );

      const combined = [
        ...deploymentRecords.map((record, index) =>
          createNotification(record, "deployment", index)
        ),

        ...accessRecords.map((record, index) =>
          createNotification(record, "access", index)
        ),

        ...issueRecords.map((record, index) =>
          createNotification(record, "issue", index)
        ),

        ...productionRecords.map((record, index) =>
          createNotification(record, "production", index)
        ),
      ];

      combined.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });

      setNotifications(combined);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      // Do not break the entire dashboard if
      // notification API is unavailable.
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) => !notification.read
    ).length;
  }, [notifications]);

  const markAsRead = useCallback((id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }, []);

  const toggleNotifications = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  const closeNotifications = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isOpen,
      markAsRead,
      markAllAsRead,
      toggleNotifications,
      closeNotifications,
      refreshNotifications: loadNotifications,
    }),
    [
      notifications,
      unreadCount,
      isOpen,
      markAsRead,
      markAllAsRead,
      toggleNotifications,
      closeNotifications,
      loadNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}
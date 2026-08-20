import { formatDistanceToNow } from "date-fns";

// Tailwind color classes per presence status (kept in sync with MessagesPage).
export const STATUS_DOT_CLASS = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  offline: "bg-gray-400",
  dnd: "bg-red-500",
  hidden: "bg-gray-400",
};

export const STATUS_LABEL = {
  online: "Online",
  away: "Away",
  dnd: "Do not disturb",
  offline: "Offline",
  hidden: "Hidden",
};

export function formatLastActive(lastActiveAt) {
  if (!lastActiveAt) return "";
  try {
    return formatDistanceToNow(new Date(lastActiveAt), { addSuffix: true });
  } catch {
    return "";
  }
}

// Returns the colored dot class, or null when the user chose to hide presence.
export function statusDotClass(status) {
  if (!status || status === "hidden") return null;
  return STATUS_DOT_CLASS[status] || STATUS_DOT_CLASS.offline;
}

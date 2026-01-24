/**
 * Notification utility for mock API errors and alerts
 * This simulates a notification system without external dependencies
 */

export type NotificationType = "error" | "warning" | "info" | "success";

export interface Notification {
  type: NotificationType;
  message: string;
  timestamp: number;
}

// In-memory notification store (for simulation purposes)
const notifications: Notification[] = [];

/**
 * Triggers an error notification
 * @param message - Error message to display
 */
export function notifyError(message: string): void {
  const notification: Notification = {
    type: "error",
    message,
    timestamp: Date.now(),
  };
  notifications.push(notification);
  console.error(`[NOTIFICATION ERROR] ${message}`);
}

/**
 * Triggers a warning notification
 * @param message - Warning message to display
 */
export function notifyWarning(message: string): void {
  const notification: Notification = {
    type: "warning",
    message,
    timestamp: Date.now(),
  };
  notifications.push(notification);
  console.warn(`[NOTIFICATION WARNING] ${message}`);
}

/**
 * Triggers an info notification
 * @param message - Info message to display
 */
export function notifyInfo(message: string): void {
  const notification: Notification = {
    type: "info",
    message,
    timestamp: Date.now(),
  };
  notifications.push(notification);
  console.info(`[NOTIFICATION INFO] ${message}`);
}

/**
 * Triggers a success notification
 * @param message - Success message to display
 */
export function notifySuccess(message: string): void {
  const notification: Notification = {
    type: "success",
    message,
    timestamp: Date.now(),
  };
  notifications.push(notification);
}

/**
 * Gets all notifications (for testing/debugging purposes)
 */
export function getNotifications(): Notification[] {
  return [...notifications];
}

/**
 * Clears all notifications (for testing/debugging purposes)
 */
export function clearNotifications(): void {
  notifications.length = 0;
}

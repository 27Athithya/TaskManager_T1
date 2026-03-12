// expo-notifications removed for Expo Go compatibility
// To enable notifications, install expo-notifications and use a development build

console.log('📱 Notifications disabled in Expo Go. Use a development build for full notification support.');

// Stub functions - notifications disabled for Expo Go compatibility
export const initializeNotifications = async () => {
  return;
};

export const getNotificationPermission = async () => {
  return { granted: false, status: 'unsupported' };
};

export const requestNotificationPermission = async () => {
  return { granted: false, status: 'unsupported' };
};

export const cancelTaskNotifications = async (taskId) => {
  return;
};

export const scheduleTaskNotifications = async (task, options = {}) => {
  return { createdNotificationId: null, dueNotificationId: null };
};
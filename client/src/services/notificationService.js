import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const ANDROID_CHANNEL_ID = 'task-reminders';

// Check if we're running in Expo Go (where notifications may not be fully supported)
const isExpoGo = Constants.appOwnership === 'expo';

// Safely set notification handler only if supported
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.warn('Unable to set notification handler:', error.message);
}

const getDueDateText = (isoDate) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'soon';

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const initializeNotifications = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1D4ED8',
      });
    }
  } catch (error) {
    console.warn('Notification initialization failed (this is expected in Expo Go):', error.message);
  }
};

export const getNotificationPermission = async () => {
  if (Platform.OS === 'web') {
    return { granted: false, status: 'unsupported' };
  }

  try {
    const settings = await Notifications.getPermissionsAsync();
    return {
      granted: Boolean(settings.granted),
      status: settings.status,
    };
  } catch (error) {
    console.warn('Unable to get notification permissions:', error.message);
    return { granted: false, status: 'unavailable' };
  }
};

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'web') {
    return { granted: false, status: 'unsupported' };
  }

  try {
    const settings = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });

    return {
      granted: Boolean(settings.granted),
      status: settings.status,
    };
  } catch (error) {
    console.warn('Unable to request notification permissions:', error.message);
    return { granted: false, status: 'unavailable' };
  }
};

export const cancelTaskNotifications = async (taskId) => {
  if (!taskId) return;

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const target = scheduled.filter(
      (item) => item.content?.data?.taskId === String(taskId)
    );

    await Promise.all(
      target.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
    );
  } catch (error) {
    console.warn('Unable to cancel notifications:', error.message);
  }
};

export const scheduleTaskNotifications = async (task, options = {}) => {
  const { notifyOnCreate = true } = options;

  if (!task?.id || !task?.dueDate) {
    return { createdNotificationId: null, dueNotificationId: null };
  }

  try {
    const permission = await getNotificationPermission();
    if (!permission.granted) {
      return { createdNotificationId: null, dueNotificationId: null };
    }

    await cancelTaskNotifications(task.id);

    let createdNotificationId = null;
    let dueNotificationId = null;

    if (notifyOnCreate) {
      createdNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Created ✅',
          body: `${task.title} is scheduled for ${getDueDateText(task.dueDate)}`,
          data: { taskId: String(task.id), type: 'created' },
        },
        trigger: null,
      });
    }

    const dueAt = new Date(task.dueDate);
    if (!Number.isNaN(dueAt.getTime()) && dueAt.getTime() > Date.now()) {
      dueNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Due Now ⏰',
          body: task.title,
          data: { taskId: String(task.id), type: 'due' },
        },
        trigger: dueAt,
      });
    }

    return { createdNotificationId, dueNotificationId };
  } catch (error) {
    console.warn('Unable to schedule notifications (this is expected in Expo Go):', error.message);
    return { createdNotificationId: null, dueNotificationId: null };
  }
};

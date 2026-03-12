import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import InputField from '../components/InputField';
import AppIcon from '../components/AppIcon';
import { taskAPI } from '../services/api';
import {
  getNotificationPermission,
  requestNotificationPermission,
  scheduleTaskNotifications,
} from '../services/notificationService';
import { colors, radius, spacing, typography } from '../theme/theme';
import { formatDateTime } from '../utils/date';

const TaskFormScreen = ({ route, navigation }) => {
  const { task } = route.params || {};
  const isEditMode = Boolean(task);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDateTime, setDueDateTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDateTime(new Date(task.dueDate));
    }

    const loadPermission = async () => {
      try {
        const result = await getNotificationPermission();
        setNotificationsEnabled(Boolean(result.granted));
      } catch (error) {
        console.error('Failed loading notification permission:', error);
      }
    };

    loadPermission();
  }, [task]);

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!dueDateTime || Number.isNaN(dueDateTime.getTime())) {
      newErrors.dueDateTime = 'Valid due date and time are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (!selectedDate) return;

    const updated = new Date(dueDateTime);
    updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    setDueDateTime(updated);
    setErrors((prev) => ({ ...prev, dueDateTime: null }));
  };

  const onTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (!selectedTime) return;

    const updated = new Date(dueDateTime);
    updated.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

    setDueDateTime(updated);
    setErrors((prev) => ({ ...prev, dueDateTime: null }));
  };

  const enableNotifications = async () => {
    try {
      const result = await requestNotificationPermission();
      if (result.granted) {
        setNotificationsEnabled(true);
        Alert.alert('Enabled', '🔔 Reminder notifications are enabled.');
      } else if (result.status === 'unavailable') {
        const isExpoGo = Constants.appOwnership === 'expo';
        Alert.alert(
          'Notifications Unavailable',
          isExpoGo
            ? 'Push notifications are not supported in Expo Go. The app will work without notifications, or use a development build for full notification support.'
            : 'Notifications are not available on this device.'
        );
      } else {
        Alert.alert('Permission Needed', 'Please enable notifications in your device settings.');
      }
    } catch (error) {
      console.error('Notification permission request failed:', error);
      Alert.alert('Error', 'Could not request notification permission.');
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please check all required fields.');
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDateTime.toISOString(),
      };

      let savedTask;
      if (isEditMode) {
        savedTask = await taskAPI.updateTask(task.id, taskData);
      } else {
        savedTask = await taskAPI.createTask(taskData);
      }

      if (notificationsEnabled) {
        await scheduleTaskNotifications(savedTask, { notifyOnCreate: !isEditMode });
      }

      Alert.alert(
        'Saved',
        isEditMode
          ? '📝 Task updated successfully.'
          : '🎉 Task created successfully.'
      );

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save task:', error);
      Alert.alert('Error', 'Failed to save task. Please confirm the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>{isEditMode ? '✏️ Edit Task' : '🚀 New Task'}</Text>
          <Text style={styles.headerSubtitle}>Use emojis in title/description if you want a lively board.</Text>
        </View>

        <InputField
          label="Task Title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setErrors((prev) => ({ ...prev, title: null }));
          }}
          placeholder="Example: 📚 Prepare project report"
          error={errors.title}
        />

        <InputField
          label="Description"
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            setErrors((prev) => ({ ...prev, description: null }));
          }}
          placeholder="Add details and context"
          multiline
          error={errors.description}
        />

        <View style={styles.dateContainer}>
          <Text style={styles.label}>
            Due Date & Time <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.dateButton, errors.dueDateTime && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <AppIcon name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.dateText}>
                {dueDateTime.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateButton, errors.dueDateTime && styles.inputError]}
              onPress={() => setShowTimePicker(true)}
            >
              <AppIcon name="clock" size={16} color={colors.textSecondary} />
              <Text style={styles.dateText}>
                {dueDateTime.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.dateHint}>Selected: {formatDateTime(dueDateTime)}</Text>
          {errors.dueDateTime && (
            <Text style={styles.errorText}>{errors.dueDateTime}</Text>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDateTime}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={isEditMode ? undefined : new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={dueDateTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity
          style={styles.permissionCard}
          onPress={enableNotifications}
        >
          <View style={styles.permissionTitleRow}>
            <AppIcon name="bell" size={18} color={colors.primary} />
            <Text style={styles.permissionTitle}>Reminder Notifications</Text>
          </View>
          <Text style={styles.permissionText}>
            {notificationsEnabled
              ? '\u2705 Enabled: this task will notify at due time.'
              : '\u26A0\uFE0F Tap here to grant permission for due-time alerts.'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <AppIcon name="check" size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Update Task' : 'Create Task'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerCard: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  headerSubtitle: {
    marginTop: 6,
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  dateContainer: {
    marginBottom: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  dateHint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  permissionCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  permissionText: {
    marginTop: 5,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});

export default TaskFormScreen;

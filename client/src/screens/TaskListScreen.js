import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import TaskCard from '../components/TaskCard';
import AppIcon from '../components/AppIcon';
import { taskAPI } from '../services/api';
import {
  getNotificationPermission,
  requestNotificationPermission,
  initializeNotifications,
  cancelTaskNotifications,
} from '../services/notificationService';
import { colors, radius, spacing, typography } from '../theme/theme';
import { isOverdue } from '../utils/date';

const TaskListScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);

  const refreshPermission = useCallback(async () => {
    try {
      await initializeNotifications();
      const result = await getNotificationPermission();
      setNotificationPermission(Boolean(result.granted));
    } catch (error) {
      console.error('Notification permission check failed:', error);
      setNotificationPermission(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getAllTasks('active');
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please confirm the API server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTasks(), refreshPermission()]);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      refreshPermission();
    }, [fetchTasks, refreshPermission])
  );

  const handleEdit = (task) => {
    navigation.navigate('TaskForm', { task });
  };

  const handleDelete = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      await cancelTaskNotifications(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  const handleComplete = async (task) => {
    try {
      await taskAPI.completeTask(task.id);
      await cancelTaskNotifications(task.id);
      setTasks((prevTasks) => prevTasks.filter((item) => item.id !== task.id));
      Alert.alert('Great job', `🎉 "${task.title}" moved to history.`);
    } catch (error) {
      console.error('Failed to complete task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  const enableNotifications = async () => {
    try {
      const result = await requestNotificationPermission();
      if (result.granted) {
        setNotificationPermission(true);
        Alert.alert('Notifications Enabled', '🔔 You will now get task reminders.');
      } else if (result.status === 'unavailable') {
        const isExpoGo = Constants.appOwnership === 'expo';
        Alert.alert(
          'Notifications Unavailable',
          isExpoGo 
            ? 'Push notifications are not supported in Expo Go. The app will work without notifications, or use a development build for full notification support.'
            : 'Notifications are not available on this device.'
        );
      } else {
        Alert.alert('Permission Needed', 'Please enable notifications from device settings.');
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
      Alert.alert('Error', 'Could not request notification permission.');
    }
  };

  const overdueCount = tasks.filter((task) => isOverdue(task.dueDate)).length;

  const renderSummary = () => (
    <View style={styles.summaryWrap}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>📋 Focus Dashboard</Text>
        <Text style={styles.heroSubtitle}>Plan smart, finish on time, and keep your history clean.</Text>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{tasks.length}</Text>
          <Text style={styles.metricLabel}>Active Tasks</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: overdueCount ? colors.warning : colors.textPrimary }]}>{overdueCount}</Text>
          <Text style={styles.metricLabel}>Overdue</Text>
        </View>
      </View>

      {!notificationPermission ? (
        <TouchableOpacity style={styles.noticeCard} onPress={enableNotifications}>
          <View style={styles.noticeTitleRow}>
            <AppIcon name="bell" size={18} color={colors.primary} />
            <Text style={styles.noticeTitle}>Enable reminders</Text>
          </View>
          <Text style={styles.noticeText}>🔔 Allow notifications to get alerts when tasks are due.</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('History')}
      >
        <AppIcon name="history" size={18} color="#FFFFFF" />
        <Text style={styles.historyButtonText}>Open History & Report</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🚀</Text>
      <Text style={styles.emptyTitle}>No active tasks</Text>
      <Text style={styles.emptySubtitle}>Tap the plus button and create your next mission.</Text>
    </View>
  );

  const renderTask = ({ item }) => (
    <TaskCard
      task={item}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onComplete={handleComplete}
      mode="active"
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={tasks.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListHeaderComponent={renderSummary}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TaskForm')}
      >
        <AppIcon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingBottom: 92,
  },
  summaryWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  heroTitle: {
    ...typography.title,
    color: '#FFFFFF',
    fontSize: 22,
  },
  heroSubtitle: {
    color: '#DBEAFE',
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  noticeCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  noticeText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  historyButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  historyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    flexGrow: 1,
    paddingBottom: 92,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B1120',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
});

export default TaskListScreen;

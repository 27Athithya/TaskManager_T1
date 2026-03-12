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
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import TaskCard from '../components/TaskCard';
import AppIcon from '../components/AppIcon';
import { taskAPI } from '../services/api';
import { cancelTaskNotifications, scheduleTaskNotifications } from '../services/notificationService';
import { colors, radius, spacing, typography } from '../theme/theme';

const HistoryScreen = ({ navigation }) => {
  const [historyTasks, setHistoryTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getTaskHistory();
      setHistoryTasks(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      Alert.alert('Error', 'Failed to load task history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleDelete = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      await cancelTaskNotifications(taskId);
      setHistoryTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete history task:', error);
      Alert.alert('Error', 'Failed to delete task.');
    }
  };

  const handleReopen = async (task) => {
    try {
      const reopened = await taskAPI.reopenTask(task.id);
      await scheduleTaskNotifications(reopened, { notifyOnCreate: false });
      setHistoryTasks((prev) => prev.filter((item) => item.id !== task.id));
      Alert.alert('Reopened', '👌 Task moved back to active list.');
    } catch (error) {
      console.error('Failed to reopen task:', error);
      Alert.alert('Error', 'Could not reopen task.');
    }
  };

  const createReportMessage = (report) => {
    const summary = report.summary || {};
    const items = report.items || [];

    const lines = [
      '📊 Task History Report',
      `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
      '',
      `Total History Items: ${summary.totalHistoryItems || 0}`,
      `Completed: ${summary.completedCount || 0}`,
      `Overdue: ${summary.overdueCount || 0}`,
      `Completed Today: ${summary.completedTodayCount || 0}`,
      '',
      'Recent Items:',
    ];

    items.slice(0, 20).forEach((item, index) => {
      const statusMark = item.status === 'completed' ? '\u2705' : '\u26A0\uFE0F';
      const due = new Date(item.dueDate).toLocaleString();
      lines.push(`${index + 1}. ${statusMark} ${item.title} (Due: ${due})`);
    });

    return lines.join('\n');
  };

  const handleShareReport = async () => {
    try {
      setSharing(true);
      const report = await taskAPI.getHistoryReport();
      const message = createReportMessage(report);

      await Share.share({
        title: 'Task History Report',
        message,
      });
    } catch (error) {
      console.error('Failed to share report:', error);
      Alert.alert('Error', 'Unable to generate and share report.');
    } finally {
      setSharing(false);
    }
  };

  const completedCount = historyTasks.filter((item) => item.status === 'completed').length;
  const overdueCount = historyTasks.length - completedCount;

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>📜 History Timeline</Text>
        <Text style={styles.heroSubtitle}>Track completed wins and overdue items from the past.</Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{completedCount}</Text>
          <Text style={styles.metricLabel}>Completed</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: overdueCount ? colors.warning : colors.textPrimary }]}>
            {overdueCount}
          </Text>
          <Text style={styles.metricLabel}>Overdue</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.shareButton, sharing && styles.shareButtonDisabled]}
        onPress={handleShareReport}
        disabled={sharing}
      >
        {sharing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <AppIcon name="report" size={18} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Generate & Share Report</Text>
            <AppIcon name="share" size={18} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📚</Text>
      <Text style={styles.emptyTitle}>No history yet</Text>
      <Text style={styles.emptySubtitle}>Completed and overdue tasks will appear here.</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('TaskForm')}>
        <Text style={styles.addButtonText}>Create New Task</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <TaskCard
      task={item}
      onEdit={(task) => navigation.navigate('TaskForm', { task })}
      onDelete={handleDelete}
      onReopen={handleReopen}
      mode="history"
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={historyTasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={historyTasks.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingBottom: 40,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 15,
  },
  headerWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  heroTitle: {
    ...typography.title,
    color: '#FFFFFF',
    fontSize: 22,
  },
  heroSubtitle: {
    marginTop: 5,
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  metricLabel: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  shareButtonDisabled: {
    opacity: 0.7,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: spacing.lg,
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
    marginTop: 6,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    marginTop: spacing.md,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default HistoryScreen;

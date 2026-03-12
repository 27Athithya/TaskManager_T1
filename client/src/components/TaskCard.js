import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AppIcon from './AppIcon';
import { colors, radius, shadows, spacing, typography } from '../theme/theme';
import { formatDateTime, getRelativeDueText, isOverdue } from '../utils/date';

const TaskCard = ({ task, onEdit, onDelete, onComplete, onReopen, mode = 'active' }) => {
  const overdue = task.status !== 'completed' && isOverdue(task.dueDate);
  const isCompleted = task.status === 'completed';

  const statusConfig = isCompleted
    ? { text: '\u2705 Done', bg: '#DCFCE7', fg: '#166534' }
    : overdue
      ? { text: '\u26A0\uFE0F Overdue', bg: '#FEE2E2', fg: '#991B1B' }
      : { text: '\u23F3 Pending', bg: '#DBEAFE', fg: '#1E3A8A' };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(task.id),
        },
      ],
      { cancelable: true }
    );
  };

  const ActionButton = ({ label, icon, onPress, variant = 'primary' }) => {
    const bgMap = {
      primary: colors.primary,
      danger: colors.danger,
      success: colors.success,
      soft: colors.surfaceSoft,
    };

    const textColor = variant === 'soft' ? colors.textPrimary : '#FFFFFF';

    return (
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: bgMap[variant] || colors.primary }]}
        onPress={onPress}
      >
        <AppIcon name={icon} size={15} color={textColor} />
        <Text style={[styles.actionButtonText, { color: textColor }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.fg }]}>{statusConfig.text}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>

        <View style={styles.metaRow}>
          <AppIcon name="calendar" size={15} color={colors.textSecondary} />
          <Text style={styles.metaText}>{formatDateTime(task.dueDate)}</Text>
        </View>
        <View style={styles.metaRow}>
          <AppIcon
            name={overdue ? 'history' : 'clock'}
            size={15}
            color={overdue ? colors.warning : colors.textSecondary}
          />
          <Text style={[styles.metaText, overdue && styles.overdueText]}>{getRelativeDueText(task.dueDate)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {mode === 'active' && onComplete ? (
          <ActionButton label="Done" icon="check" onPress={() => onComplete(task)} variant="success" />
        ) : null}
        {mode !== 'active' && onReopen ? (
          <ActionButton label="Reopen" icon="history" onPress={() => onReopen(task)} variant="soft" />
        ) : null}
        {onEdit ? (
          <ActionButton label="Edit" icon="edit" onPress={() => onEdit(task)} variant="primary" />
        ) : null}
        <ActionButton label="Delete" icon="trash" onPress={handleDelete} variant="danger" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm - 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.card,
  },
  content: {
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  overdueText: {
    color: colors.warning,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
});

export default TaskCard;

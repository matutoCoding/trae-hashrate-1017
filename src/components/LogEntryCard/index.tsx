import React from 'react';
import { View, Text } from '@tarojs/components';
import { TrainingLogEntry, ATTEMPT_STATUS_LABELS, FAIL_CATEGORY_LABELS } from '@/types/training';
import DifficultyBadge from '@/components/DifficultyBadge';
import styles from './index.module.scss';

interface LogEntryCardProps {
  log: TrainingLogEntry;
  onClick?: () => void;
}

const LogEntryCard: React.FC<LogEntryCardProps> = ({ log, onClick }) => {
  const statusColor = {
    flash: '#52C41A',
    send: '#1890FF',
    project: '#FAAD14',
    fail: '#F5222D',
    partial: '#86909C'
  }[log.status];

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.routeInfo}>
          <Text className={styles.routeName}>{log.routeName}</Text>
          <DifficultyBadge grade={log.routeGrade as any} size="sm" showLabel={false} />
        </View>
        <View className={styles.status} style={{ backgroundColor: statusColor }}>
          <Text className={styles.statusText}>{ATTEMPT_STATUS_LABELS[log.status]}</Text>
        </View>
      </View>

      <View className={styles.metaRow}>
        <Text className={styles.date}>{log.date}</Text>
        <Text className={styles.attempts}>{log.attempts}次尝试</Text>
      </View>

      <View className={styles.progressRow}>
        <Text className={styles.progressLabel}>完成度</Text>
        <View className={styles.progressBar}>
          <View
            className={styles.progressFill}
            style={{
              width: `${log.completionPercent}%`,
              backgroundColor: statusColor
            }}
          />
        </View>
        <Text className={styles.progressValue}>{log.completionPercent}%</Text>
      </View>

      {log.failPoint && (
        <View className={styles.failRow}>
          <Text className={styles.failLabel}>失败点</Text>
          <Text className={styles.failPoint}>{log.failPoint}</Text>
          {log.failCategory && (
            <View className={styles.failCategory}>
              <Text className={styles.failCategoryText}>{FAIL_CATEGORY_LABELS[log.failCategory]}</Text>
            </View>
          )}
        </View>
      )}

      {log.notes && (
        <View className={styles.notesRow}>
          <Text className={styles.notesText}>{log.notes}</Text>
        </View>
      )}

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statLabel}>热身质量</Text>
          <Text className={styles.statValue}>{log.warmupQuality}/10</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statLabel}>能量水平</Text>
          <Text className={styles.statValue}>{log.energyLevel}/10</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statLabel}>时长</Text>
          <Text className={styles.statValue}>{log.durationMinutes}分钟</Text>
        </View>
      </View>
    </View>
  );
};

export default LogEntryCard;

import React from 'react';
import { View, Text } from '@tarojs/components';
import { Route } from '@/types/bouldering';
import DifficultyBadge from '@/components/DifficultyBadge';
import styles from './index.module.scss';

interface RouteCardProps {
  route: Route;
  onClick?: () => void;
  showDetails?: boolean;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onClick, showDetails = true }) => {
  const consistencyColor = {
    excellent: '#52C41A',
    good: '#1890FF',
    fair: '#FAAD14',
    poor: '#F5222D'
  }[route.gradeConsistency || 'good'];

  const consistencyLabel = {
    excellent: '评级精准',
    good: '评级合理',
    fair: '评级偏差',
    poor: '评级不准'
  }[route.gradeConsistency || 'good'];

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <Text className={styles.routeName}>{route.name}</Text>
        <DifficultyBadge grade={route.grade} size="sm" showLabel={false} />
      </View>

      {showDetails && (
        <>
          <View className={styles.metaRow}>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>定线员</Text>
              <Text className={styles.metaValue}>{route.setter}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>岩壁角度</Text>
              <Text className={styles.metaValue}>{route.wallAngle}°</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>岩点数</Text>
              <Text className={styles.metaValue}>{route.holds.length}</Text>
            </View>
          </View>

          {route.tags && route.tags.length > 0 && (
            <View className={styles.tagsRow}>
              {route.tags.map((tag, i) => (
                <View key={i} className={styles.tag}>
                  <Text className={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {route.calculatedGrade && (
            <View className={styles.consistencyRow}>
              <Text className={styles.consistencyLabel}>系统计算：</Text>
              <Text className={styles.consistencyValue} style={{ color: consistencyColor }}>
                {route.calculatedGrade} · {consistencyLabel}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default RouteCard;

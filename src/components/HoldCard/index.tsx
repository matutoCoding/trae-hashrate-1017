import React from 'react';
import { View, Text } from '@tarojs/components';
import { HoldPoint, HOLD_SHAPE_LABELS, HOLD_ORIENTATION_LABELS } from '@/types/bouldering';
import styles from './index.module.scss';

interface HoldCardProps {
  hold: HoldPoint;
  isSelected?: boolean;
  onClick?: () => void;
}

const HoldCard: React.FC<HoldCardProps> = ({ hold, isSelected, onClick }) => {
  const getHoldTypeColor = () => {
    switch (hold.type) {
      case 'start': return '#52C41A';
      case 'finish': return '#F5222D';
      case 'foot': return '#1890FF';
      default: return '#FF6B35';
    }
  };

  return (
    <View
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <View className={styles.header}>
        <View className={styles.holdName} style={{ borderColor: getHoldTypeColor() }}>
          <Text className={styles.nameText}>{hold.name}</Text>
        </View>
        <View className={styles.typeBadge} style={{ backgroundColor: getHoldTypeColor() }}>
          <Text className={styles.typeText}>
            {hold.type === 'start' ? '起点' : hold.type === 'finish' ? '终点' : hold.type === 'foot' ? '脚点' : '中间'}
          </Text>
        </View>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.label}>形状</Text>
        <Text className={styles.value}>{HOLD_SHAPE_LABELS[hold.shape]}</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.label}>朝向</Text>
        <Text className={styles.value}>{HOLD_ORIENTATION_LABELS[hold.orientation]}</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.label}>位置</Text>
        <Text className={styles.value}>({hold.x}, {hold.y})</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.label}>难度</Text>
        <View className={styles.difficultyBar}>
          <View
            className={styles.difficultyFill}
            style={{ width: `${Math.min(100, hold.holdDifficulty * 10)}%` }}
          />
        </View>
        <Text className={styles.difficultyValue}>{hold.holdDifficulty.toFixed(1)}</Text>
      </View>
    </View>
  );
};

export default HoldCard;

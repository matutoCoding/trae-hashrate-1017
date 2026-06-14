import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { DifficultyGrade, DIFFICULTY_COLORS } from '@/types/bouldering';
import styles from './index.module.scss';

interface DifficultyBadgeProps {
  grade: DifficultyGrade;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  grade,
  size = 'md',
  showLabel = true
}) => {
  const color = DIFFICULTY_COLORS[grade] || '#86909C';

  return (
    <View
      className={classnames(styles.badge, styles[size])}
      style={{ backgroundColor: color, borderColor: color }}
    >
      <Text className={styles.text}>{grade}</Text>
      {showLabel && <Text className={styles.label}>{getGradeLabel(grade)}</Text>}
    </View>
  );
};

function getGradeLabel(grade: DifficultyGrade): string {
  const labels: Record<DifficultyGrade, string> = {
    V0: '入门', V1: '新手', V2: '初级',
    V3: '初中级', V4: '中级', V5: '中高级',
    V6: '高级', V7: '专家', V8: '精英', V9: '大师'
  };
  return labels[grade] || '';
}

export default DifficultyBadge;

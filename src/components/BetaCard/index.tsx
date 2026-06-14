import React from 'react';
import { View, Text } from '@tarojs/components';
import { MovementBeta } from '@/types/training';
import DifficultyBadge from '@/components/DifficultyBadge';
import styles from './index.module.scss';

interface BetaCardProps {
  beta: MovementBeta;
  onClick?: () => void;
}

const BetaCard: React.FC<BetaCardProps> = ({ beta, onClick }) => {
  const difficultyColors = {
    beginner: '#52C41A',
    intermediate: '#1890FF',
    advanced: '#FAAD14',
    expert: '#F5222D'
  };

  const difficultyLabels = {
    beginner: '入门级',
    intermediate: '中级',
    advanced: '高级',
    expert: '专家级'
  };

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{beta.title}</Text>
          <View className={styles.likes}>
            <Text className={styles.likesIcon}>👍</Text>
            <Text className={styles.likesCount}>{beta.likes}</Text>
          </View>
        </View>
        <View className={styles.routeRow}>
          <Text className={styles.routeName}>{beta.routeName}</Text>
          <DifficultyBadge grade={beta.routeGrade as any} size="sm" showLabel={false} />
        </View>
      </View>

      <View className={styles.metaRow}>
        <View
          className={styles.difficultyTag}
          style={{ backgroundColor: `${difficultyColors[beta.difficulty]}30`, color: difficultyColors[beta.difficulty] }}
        >
          <Text className={styles.difficultyText}>{difficultyLabels[beta.difficulty]}</Text>
        </View>
        <Text className={styles.author}>by {beta.author}</Text>
        <Text className={styles.date}>{beta.createdAt}</Text>
      </View>

      <View className={styles.tagsRow}>
        {beta.tags.map((tag, i) => (
          <View key={i} className={styles.tag}>
            <Text className={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View className={styles.bodyTypesRow}>
        <Text className={styles.bodyLabel}>适合身高：</Text>
        {beta.bodyType.map((bt, i) => (
          <View key={i} className={styles.bodyTag}>
            <Text className={styles.bodyText}>
              {bt === 'short' ? '小个子' : bt === 'average' ? '中等' : '高个子'}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.tipsRow}>
        <Text className={styles.tipsLabel}>💡 核心技巧</Text>
        <Text className={styles.tipsText}>{beta.overallTips}</Text>
      </View>

      <View className={styles.stepsRow}>
        <Text className={styles.stepsCount}>共 {beta.steps.length} 步拆解</Text>
      </View>
    </View>
  );
};

export default BetaCard;

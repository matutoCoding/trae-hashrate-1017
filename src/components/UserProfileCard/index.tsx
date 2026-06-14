import React from 'react';
import { View, Text } from '@tarojs/components';
import { ClimberProfile } from '@/types/user';
import styles from './index.module.scss';

interface UserProfileCardProps {
  profile: ClimberProfile;
  onEdit?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ profile, onEdit }) => {
  const getStrengthLevel = (value: number) => {
    if (value >= 8) return { label: '优秀', color: '#52C41A' };
    if (value >= 6) return { label: '良好', color: '#1890FF' };
    if (value >= 4) return { label: '一般', color: '#FAAD14' };
    return { label: '待提升', color: '#F5222D' };
  };

  const StrengthBar = ({ label, value }: { label: string; value: number }) => {
    const level = getStrengthLevel(value);
    return (
      <View className={styles.strengthItem}>
        <Text className={styles.strengthLabel}>{label}</Text>
        <View className={styles.strengthBar}>
          <View
            className={styles.strengthFill}
            style={{ width: `${value * 10}%`, backgroundColor: level.color }}
          />
        </View>
        <Text className={styles.strengthValue} style={{ color: level.color }}>{level.label}</Text>
      </View>
    );
  };

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>{profile.name.charAt(0)}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{profile.name}</Text>
          <View className={styles.basicInfo}>
            <Text className={styles.basicItem}>身高 {profile.height}cm</Text>
            <Text className={styles.basicItem}>臂展 {profile.armSpan}cm</Text>
            <Text className={styles.apeIndex}>
              Ape Index {profile.apeIndex > 0 ? '+' : ''}{profile.apeIndex}cm
            </Text>
          </View>
        </View>
        {onEdit && (
          <View className={styles.editBtn} onClick={onEdit}>
            <Text className={styles.editText}>编辑</Text>
          </View>
        )}
      </View>

      <View className={styles.gradeRow}>
        <View className={styles.gradeItem}>
          <Text className={styles.gradeLabel}>最高能力</Text>
          <Text className={styles.gradeValue}>{profile.maxGrade}</Text>
        </View>
        <View className={styles.gradeItem}>
          <Text className={styles.gradeLabel}>红点</Text>
          <Text className={styles.gradeValue}>{profile.redpointGrade}</Text>
        </View>
        <View className={styles.gradeItem}>
          <Text className={styles.gradeLabel}>Flash</Text>
          <Text className={styles.gradeValue}>{profile.onSightGrade}</Text>
        </View>
      </View>

      <View className={styles.divider} />

      <Text className={styles.sectionTitle}>体能指标</Text>

      <StrengthBar label="指力" value={profile.fingerStrength} />
      <StrengthBar label="核心" value={profile.coreStrength} />
      <StrengthBar label="拉力" value={profile.pullStrength} />
      <StrengthBar label="动态" value={profile.dynamicAbility} />

      <View className={styles.styleRow}>
        <Text className={styles.sectionTitle}>攀爬风格</Text>
        <View className={styles.styleTags}>
          {profile.climbingStyle.map((style, i) => (
            <View key={i} className={styles.styleTag}>
              <Text className={styles.styleTagText}>
                {style === 'power' ? '力量型' : style === 'endurance' ? '耐力型' : style === 'technique' ? '技术型' : '动态型'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {profile.weakPoints && profile.weakPoints.length > 0 && (
        <View className={styles.weakRow}>
          <Text className={styles.sectionTitle}>待提升项</Text>
          <View className={styles.weakTags}>
            {profile.weakPoints.map((wp, i) => (
            <View key={i} className={styles.weakTag}>
              <Text className={styles.weakTagText}>{wp}</Text>
            </View>
          ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default UserProfileCard;

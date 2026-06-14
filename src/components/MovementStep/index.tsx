import React from 'react';
import { View, Text } from '@tarojs/components';
import { MovementStep, MOVEMENT_TYPE_LABELS, FORCE_DIRECTION_LABELS, BALANCE_STATE_LABELS, INJURY_RISK_LABELS } from '@/types/movement';
import styles from './index.module.scss';

interface MovementStepProps {
  step: MovementStep;
}

const MovementStepComponent: React.FC<MovementStepProps> = ({ step }) => {
  const getBalanceColor = (state: string) => {
    const map: Record<string, string> = {
      stable: '#52C41A',
      moderate: '#1890FF',
      unstable: '#FAAD14',
      critical: '#F5222D'
    };
    return map[state] || '#86909C';
  };

  const getRiskColor = (risk: string) => {
    const map: Record<string, string> = {
      low: '#52C41A',
      medium: '#1890FF',
      high: '#FAAD14',
      critical: '#F5222D'
    };
    return map[risk] || '#86909C';
  };

  return (
    <View className={`${styles.container} ${step.isCrux ? styles.crux : ''}`}>
      <View className={styles.header}>
        <View className={styles.stepIndex}>
          <Text className={styles.stepIndexText}>{step.stepIndex}</Text>
        </View>
        {step.isCrux && (
          <View className={styles.cruxBadge}>
            <Text className={styles.cruxText}>卡点</Text>
          </View>
        )}
        <View className={styles.movementType}>
          <Text className={styles.movementTypeText}>{MOVEMENT_TYPE_LABELS[step.movementType]}</Text>
        </View>
      </View>

      <Text className={styles.description}>{step.description}</Text>

      <View className={styles.bodyPosition}>
        <View className={styles.positionCol}>
          <Text className={styles.positionLabel}>左手</Text>
          <Text className={styles.positionValue}>{step.leftHand || '-'}</Text>
        </View>
        <View className={styles.positionCol}>
          <Text className={styles.positionLabel}>右手</Text>
          <Text className={styles.positionValue}>{step.rightHand || '-'}</Text>
        </View>
        <View className={styles.positionCol}>
          <Text className={styles.positionLabel}>左脚</Text>
          <Text className={styles.positionValue}>{step.leftFoot || '-'}</Text>
        </View>
        <View className={styles.positionCol}>
          <Text className={styles.positionLabel}>右脚</Text>
          <Text className={styles.positionValue}>{step.rightFoot || '-'}</Text>
        </View>
      </View>

      <View className={styles.analysisGrid}>
        <View className={styles.analysisItem}>
          <Text className={styles.analysisLabel}>发力方向</Text>
          <Text className={styles.analysisValue}>{FORCE_DIRECTION_LABELS[step.primaryForceDirection]}</Text>
        </View>
        <View className={styles.analysisItem}>
          <Text className={styles.analysisLabel}>发力强度</Text>
          <View className={styles.forceBar}>
            <View className={styles.forceFill} style={{ width: `${step.forceMagnitude}%` }} />
          </View>
          <Text className={styles.forceValue}>{step.forceMagnitude}%</Text>
        </View>
        <View className={styles.analysisItem}>
          <Text className={styles.analysisLabel}>身体平衡</Text>
          <Text className={styles.analysisValue} style={{ color: getBalanceColor(step.balanceState) }}>
            {BALANCE_STATE_LABELS[step.balanceState]}
          </Text>
        </View>
        <View className={styles.analysisItem}>
          <Text className={styles.analysisLabel}>受伤风险</Text>
          <Text className={styles.analysisValue} style={{ color: getRiskColor(step.injuryRisk) }}>
            {INJURY_RISK_LABELS[step.injuryRisk]}
          </Text>
        </View>
      </View>

      <View className={styles.torqueSection}>
        <Text className={styles.sectionLabel}>关节力矩分析</Text>
        <View className={styles.torqueRow}>
          <View className={styles.torqueItem}>
            <Text className={styles.torqueLabel}>肩部</Text>
            <Text className={styles.torqueValue}>{step.torque.shoulderTorque}</Text>
          </View>
          <View className={styles.torqueItem}>
            <Text className={styles.torqueLabel}>肘部</Text>
            <Text className={styles.torqueValue}>{step.torque.elbowTorque}</Text>
          </View>
          <View className={styles.torqueItem}>
            <Text className={styles.torqueLabel}>髋部</Text>
            <Text className={styles.torqueValue}>{step.torque.hipTorque}</Text>
          </View>
          <View className={styles.torqueItem}>
            <Text className={styles.torqueLabel}>膝部</Text>
            <Text className={styles.torqueValue}>{step.torque.kneeTorque}</Text>
          </View>
          <View className={styles.torqueItem}>
            <Text className={styles.torqueLabel}>综合应力</Text>
            <Text className={styles.torqueValue} style={{ color: getRiskColor(step.injuryRisk) }}>
              {step.torque.totalStressScore}
            </Text>
          </View>
        </View>
      </View>

      {step.dynamicSuccessRate !== undefined && (
        <View className={styles.dynamicSection}>
          <Text className={styles.sectionLabel}>动态动作成功率</Text>
          <View className={styles.dynamicBar}>
            <View
              className={`${styles.dynamicFill} ${step.dynamicSuccessRate < 50 ? styles.low : step.dynamicSuccessRate < 70 ? styles.medium : styles.high}`}
              style={{ width: `${step.dynamicSuccessRate}%` }}
            />
          </View>
          <Text className={styles.dynamicValue}>{step.dynamicSuccessRate}%</Text>
        </View>
      )}

      {step.injuryWarning && (
        <View className={styles.warningBox}>
          <Text className={styles.warningIcon}>⚠️</Text>
          <Text className={styles.warningText}>{step.injuryWarning}</Text>
        </View>
      )}

      {step.footSequenceImpact && (
        <View className={styles.footNote}>
          <Text className={styles.footNoteLabel}>🦶 脚点分析</Text>
          <Text className={styles.footNoteText}>{step.footSequenceImpact}</Text>
        </View>
      )}
    </View>
  );
};

export default MovementStepComponent;

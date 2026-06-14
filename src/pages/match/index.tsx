import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import { useBoulderingStore } from '@/store/useBoulderingStore';
import { RouteMatchResult } from '@/types/user';
import UserProfileCard from '@/components/UserProfileCard';
import DifficultyBadge from '@/components/DifficultyBadge';
import { matchRouteToClimber, simulateDifferentHeights } from '@/utils/reachability';
import styles from './index.module.scss';

type SuitabilityFilter = 'all' | 'perfect' | 'good' | 'challenging' | 'tooHard';

const MatchPage: React.FC = () => {
  const { currentUser, routes } = useBoulderingStore();
  const [suitabilityFilter, setSuitabilityFilter] = useState<SuitabilityFilter>('all');
  const [showSimulation, setShowSimulation] = useState<string | null>(routes[0]?.id || null);

  const matchResults: RouteMatchResult[] = useMemo(() => {
    return routes.map(route => matchRouteToClimber(route, currentUser))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [routes, currentUser]);

  const filteredResults = useMemo(() => {
    if (suitabilityFilter === 'all') return matchResults;
    return matchResults.filter(r => r.suitability === suitabilityFilter);
  }, [matchResults, suitabilityFilter]);

  const simulationResults = useMemo(() => {
    if (!showSimulation) return null;
    const route = routes.find(r => r.id === showSimulation);
    if (!route) return null;
    return { route, simulations: simulateDifferentHeights(route, currentUser.armSpan) };
  }, [showSimulation, routes, currentUser.armSpan]);

  const getSuitabilityStyle = (suitability: RouteMatchResult['suitability']) => {
    const map = {
      perfect: { label: '完美适配', color: '#52C41A', bg: 'rgba(82, 196, 26, 0.2)' },
      good: { label: '较为适合', color: '#1890FF', bg: 'rgba(24, 144, 255, 0.2)' },
      challenging: { label: '有挑战', color: '#FAAD14', bg: 'rgba(250, 173, 20, 0.2)' },
      tooHard: { label: '难度过高', color: '#F5222D', bg: 'rgba(245, 34, 45, 0.2)' },
      tooEasy: { label: '过于简单', color: '#86909C', bg: 'rgba(134, 144, 156, 0.2)' }
    };
    return map[suitability];
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 75) return '#52C41A';
    if (rate >= 50) return '#1890FF';
    if (rate >= 30) return '#FAAD14';
    return '#F5222D';
  };

  const suitabilityOptions: { value: SuitabilityFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'perfect', label: '完美' },
    { value: 'good', label: '适合' },
    { value: 'challenging', label: '挑战' },
    { value: 'tooHard', label: '过难' }
  ];

  console.log('[Match] Generated', matchResults.length, 'match results for user:', currentUser.name);

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>难度匹配</Text>
        <Text className={styles.pageSubtitle}>根据您的体能档案智能推荐线路</Text>
      </View>

      <UserProfileCard profile={currentUser} />

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>🎯 线路匹配推荐</Text>
        <Text className={styles.sectionSubtitle}>共 {matchResults.length} 条线路</Text>
      </View>

      <View className={styles.filterBar}>
        {suitabilityOptions.map(opt => (
          <View
            key={opt.value}
            className={classnames(styles.filterTag, suitabilityFilter === opt.value && styles.active)}
            onClick={() => setSuitabilityFilter(opt.value)}
          >
            <Text className={styles.filterTagText}>{opt.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY>
        {filteredResults.map(result => {
          const route = routes.find(r => r.id === result.routeId)!;
          const style = getSuitabilityStyle(result.suitability);
          const successColor = getSuccessRateColor(result.estimatedSuccessRate);

          return (
            <View key={result.routeId} className={styles.matchCard}>
              <View className={styles.suitabilityBadge} style={{ backgroundColor: style.color }}>
                <Text className={styles.suitabilityBadgeText}>{style.label}</Text>
              </View>

              <View className={styles.matchScoreBadge}>
                <Text className={styles.matchScore}>{result.matchScore}</Text>
                <Text className={styles.matchScoreLabel}>匹配分</Text>
              </View>

              <View className={styles.routeHeader}>
                <View style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Text className={styles.routeName}>{result.routeName}</Text>
                  <DifficultyBadge grade={route.grade} size="sm" showLabel={false} />
                </View>
                <Text className={styles.routeMeta}>
                  {route.setter}定线 · 岩壁{route.wallAngle}° · {route.holds.length}个岩点
                </Text>
              </View>

              <View className={styles.successRateSection}>
                <Text className={styles.successRateLabel}>预估成功率</Text>
                <View className={styles.successRateBar}>
                  <View
                    className={styles.successRateFill}
                    style={{
                      width: `${result.estimatedSuccessRate}%`,
                      backgroundColor: successColor
                    }}
                  />
                </View>
                <Text className={styles.successRateValue} style={{ color: successColor }}>
                  {result.estimatedSuccessRate}%
                </Text>
              </View>

              <View className={styles.matchDetails}>
                {result.strongPointMatches.length > 0 && (
                  <View className={styles.matchDetailRow}>
                    <Text className={styles.matchDetailIcon}>✅</Text>
                    <View className={styles.matchDetailContent}>
                      <Text className={styles.matchDetailLabel}>优势匹配</Text>
                      <Text className={styles.matchDetailText}>
                        {result.strongPointMatches.join('、')}
                      </Text>
                    </View>
                  </View>
                )}

                {result.weakPointMatches.length > 0 && (
                  <View className={styles.matchDetailRow}>
                    <Text className={styles.matchDetailIcon}>⚠️</Text>
                    <View className={styles.matchDetailContent}>
                      <Text className={styles.matchDetailLabel}>薄弱点挑战</Text>
                      <Text className={styles.matchDetailText}>
                        {result.weakPointMatches.join('、')}
                      </Text>
                    </View>
                  </View>
                )}

                {result.reachabilityIssues.length > 0 && (
                  <View className={styles.matchDetailRow}>
                    <Text className={styles.matchDetailIcon}>📏</Text>
                    <View className={styles.matchDetailContent}>
                      <Text className={styles.matchDetailLabel}>可达性问题</Text>
                      <Text className={styles.matchDetailText}>
                        {result.reachabilityIssues.join('；')}
                      </Text>
                    </View>
                  </View>
                )}

                {result.cruxMovements.length > 0 && (
                  <View className={styles.matchDetailRow}>
                    <Text className={styles.matchDetailIcon}>🎯</Text>
                    <View className={styles.matchDetailContent}>
                      <Text className={styles.matchDetailLabel}>卡点动作</Text>
                      <View className={styles.cruxTags}>
                        {result.cruxMovements.map((m, i) => (
                          <View key={i} className={styles.cruxTag}>
                            <Text className={styles.cruxTagText}>{m}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>

              <View
                className={classnames(styles.filterTag, showSimulation === route.id && styles.active)}
                style={{ display: 'inline-flex', marginTop: 8 }}
                onClick={() => setShowSimulation(showSimulation === route.id ? null : route.id)}
              >
                <Text className={styles.filterTagText}>
                  {showSimulation === route.id ? '收起身高模拟' : '查看不同身高模拟'}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {simulationResults && (
        <View style={{ marginTop: 32 }}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>📏 身高臂展模拟</Text>
          </View>

          <View className={styles.simulationCard}>
            <View className={styles.simulationHeader}>
              <Text className={styles.simulationTitle}>线路可达性对比</Text>
              <Text className={styles.simulationRoute}>{simulationResults.route.name}</Text>
            </View>

            {simulationResults.simulations.map((sim, i) => (
              <View key={i} className={styles.simulationItem}>
                <View className={styles.simulationItemHeader}>
                  <Text className={styles.simulationHeight}>
                    身高 {sim.height}cm · 臂展 {sim.armSpan}cm
                  </Text>
                  <View className={styles.simulationGrade}>
                    <Text className={styles.simulationGradeText}>{sim.estimatedGrade}</Text>
                  </View>
                </View>

                <View className={styles.simulationStats}>
                  <View className={styles.simulationStat}>
                    <Text className={styles.simulationStatLabel}>可达性评分</Text>
                    <Text className={styles.simulationStatValue}>{sim.overallScore}/100</Text>
                  </View>
                  <View className={styles.simulationStat}>
                    <Text className={styles.simulationStatLabel}>不可达岩点</Text>
                    <Text className={styles.simulationStatValue}>
                      {sim.reachability.filter(r => !r.isReachable).length} 个
                    </Text>
                  </View>
                </View>

                <Text className={styles.simulationNotes}>💡 {sim.notes}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default MatchPage;

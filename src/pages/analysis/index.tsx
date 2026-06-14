import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useBoulderingStore } from '@/store/useBoulderingStore';
import { Route, DIFFICULTY_COLORS } from '@/types/bouldering';
import { MovementBreakdown } from '@/types/movement';
import RouteCard from '@/components/RouteCard';
import MovementStepComponent from '@/components/MovementStep';
import styles from './index.module.scss';

const AnalysisPage: React.FC = () => {
  const { routes, movements } = useBoulderingStore();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(routes[0] || null);
  const [showRouteList, setShowRouteList] = useState(false);

  const currentMovement = useMemo<MovementBreakdown | null>(() => {
    if (!selectedRoute) return null;
    return movements.find(m => m.routeId === selectedRoute.id) || null;
  }, [selectedRoute, movements]);

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    setShowRouteList(false);
    console.log('[Analysis] Selected route:', route.name);
  };

  if (routes.length === 0) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.pageHeader}>
          <Text className={styles.pageTitle}>动作拆解</Text>
          <Text className={styles.pageSubtitle}>分析线路的每一步动作</Text>
        </View>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🧗</Text>
          <Text className={styles.emptyTitle}>暂无可分析线路</Text>
          <Text className={styles.emptyText}>请先在"线路录入"页面添加线路</Text>
          <View className={styles.goRouteBtn} onClick={() => Taro.switchTab({ url: '/pages/route/index' })}>
            <Text className={styles.goRouteBtnText}>去添加线路</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>动作拆解</Text>
        <Text className={styles.pageSubtitle}>分析线路的每一步动作、发力与受力</Text>
      </View>

      <View className={styles.routeSelector} onClick={() => setShowRouteList(true)}>
        <View className={styles.routeSelectorHeader}>
          <Text className={styles.selectorLabel}>当前分析线路</Text>
          <View className={styles.changeBtn}>
            <Text className={styles.changeBtnText}>切换</Text>
          </View>
        </View>
        {selectedRoute ? (
          <>
            <Text className={styles.selectedRouteName}>
              {selectedRoute.name}
              <Text style={{ color: DIFFICULTY_COLORS[selectedRoute.grade], marginLeft: 16, fontSize: 24 }}>
                [{selectedRoute.grade}]
              </Text>
            </Text>
            <Text className={styles.selectedRouteMeta}>
              岩壁 {selectedRoute.wallAngle}° · {selectedRoute.holds.length}个岩点 · 定线员 {selectedRoute.setter}
            </Text>
          </>
        ) : (
          <Text className={styles.selectedRouteName}>请选择一条线路</Text>
        )}
      </View>

      {!currentMovement ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📝</Text>
          <Text className={styles.emptyTitle}>该线路暂无动作拆解</Text>
          <Text className={styles.emptyText}>选择线路后可以添加动作拆解</Text>
          <View className={styles.actionsBar}>
            <View className={`${styles.actionBtn} ${styles.primary}`}>
              <Text className={styles.actionBtnText}>新建动作拆解</Text>
            </View>
          </View>
        </View>
      ) : (
        <ScrollView scrollY>
          <View className={styles.overviewCard}>
            <Text className={styles.overviewTitle}>📊 整体分析概览</Text>
            <View className={styles.overviewGrid}>
              <View className={styles.overviewItem}>
                <Text className={styles.overviewItemLabel}>综合难度分</Text>
                <Text className={styles.overviewItemValue}>{currentMovement.overallDifficultyScore.toFixed(1)}</Text>
              </View>
              <View className={styles.overviewItem}>
                <Text className={styles.overviewItemLabel}>系统估算难度</Text>
                <Text className={styles.overviewItemValue}>{currentMovement.estimatedGrade}</Text>
              </View>
            </View>

            {currentMovement.cruxSteps && currentMovement.cruxSteps.length > 0 && (
              <View className={styles.cruxList}>
                <Text className={styles.cruxListLabel}>🎯 卡点动作</Text>
                {currentMovement.cruxSteps.map((step, i) => (
                  <Text key={i} className={styles.cruxListItem}>• {step}</Text>
                ))}
              </View>
            )}

            {currentMovement.criticalInjuryRisks && currentMovement.criticalInjuryRisks.length > 0 && (
              <View className={styles.riskWarning}>
                <Text className={styles.riskIcon}>⚠️</Text>
                <View style={{ flex: 1 }}>
                  {currentMovement.criticalInjuryRisks.map((risk, i) => (
                    <Text key={i} className={styles.riskText}>• {risk}</Text>
                  ))}
                </View>
              </View>
            )}

            {currentMovement.footSequenceAnalysis && (
              <View className={styles.footAnalysis}>
                <Text className={styles.footAnalysisLabel}>🦶 脚点序列分析</Text>
                <Text className={styles.footAnalysisText}>{currentMovement.footSequenceAnalysis}</Text>
              </View>
            )}
          </View>

          <Text className={styles.overviewTitle} style={{ marginBottom: 24 }}>
            📋 动作步骤详情
          </Text>

          {currentMovement.steps.map(step => (
            <MovementStepComponent key={step.id} step={step} />
          ))}
        </ScrollView>
      )}

      {showRouteList && (
        <View className={styles.routeListModal} onClick={() => setShowRouteList(false)}>
          <ScrollView
            className={styles.routeListContent}
            onClick={e => e.stopPropagation && (e as any).stopPropagation()}
          >
            <View className={styles.routeListHeader}>
              <Text className={styles.routeListTitle}>选择要分析的线路</Text>
              <View className={styles.changeBtn} onClick={() => setShowRouteList(false)}>
                <Text className={styles.changeBtnText}>关闭</Text>
              </View>
            </View>
            {routes.map(route => (
              <View key={route.id} onClick={() => handleSelectRoute(route)}>
                <RouteCard route={route} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default AnalysisPage;

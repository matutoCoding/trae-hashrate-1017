import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Slider } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useBoulderingStore } from '@/store/useBoulderingStore';
import { RouteMatchResult } from '@/types/user';
import { DifficultyGrade } from '@/types/bouldering';
import UserProfileCard from '@/components/UserProfileCard';
import DifficultyBadge from '@/components/DifficultyBadge';
import { matchRouteToClimber, simulateDifferentHeights } from '@/utils/reachability';
import styles from './index.module.scss';

type SuitabilityFilter = 'all' | 'perfect' | 'good' | 'challenging' | 'tooHard';

const ALL_GRADES: DifficultyGrade[] = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9'];
const CLIMBING_STYLES = [
  { value: 'power', label: '力量型' },
  { value: 'endurance', label: '耐力型' },
  { value: 'technique', label: '技术型' },
  { value: 'dynamic', label: '动态型' }
] as const;
const WEAK_POINT_OPTIONS = ['指力', '核心', '拉力', '动态', '耐力', '技术', '平衡', '身高臂展'];

const MatchPage: React.FC = () => {
  const { currentUser, routes, updateUserProfile } = useBoulderingStore();
  const [suitabilityFilter, setSuitabilityFilter] = useState<SuitabilityFilter>('all');
  const [showSimulation, setShowSimulation] = useState<string | null>(routes[0]?.id || null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editName, setEditName] = useState(currentUser.name);
  const [editHeight, setEditHeight] = useState(currentUser.height);
  const [editArmSpan, setEditArmSpan] = useState(currentUser.armSpan);
  const [editFinger, setEditFinger] = useState(currentUser.fingerStrength);
  const [editCore, setEditCore] = useState(currentUser.coreStrength);
  const [editPull, setEditPull] = useState(currentUser.pullStrength);
  const [editDynamic, setEditDynamic] = useState(currentUser.dynamicAbility);
  const [editMaxGrade, setEditMaxGrade] = useState<DifficultyGrade>(currentUser.maxGrade as DifficultyGrade);
  const [editRedpoint, setEditRedpoint] = useState<DifficultyGrade>(currentUser.redpointGrade as DifficultyGrade);
  const [editOnsight, setEditOnsight] = useState<DifficultyGrade>(currentUser.onSightGrade as DifficultyGrade);
  const [editStyles, setEditStyles] = useState<string[]>([...currentUser.climbingStyle]);
  const [editWeakPoints, setEditWeakPoints] = useState<string[]>([...currentUser.weakPoints]);

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

  const openEditModal = () => {
    setEditName(currentUser.name);
    setEditHeight(currentUser.height);
    setEditArmSpan(currentUser.armSpan);
    setEditFinger(currentUser.fingerStrength);
    setEditCore(currentUser.coreStrength);
    setEditPull(currentUser.pullStrength);
    setEditDynamic(currentUser.dynamicAbility);
    setEditMaxGrade(currentUser.maxGrade as DifficultyGrade);
    setEditRedpoint(currentUser.redpointGrade as DifficultyGrade);
    setEditOnsight(currentUser.onSightGrade as DifficultyGrade);
    setEditStyles([...currentUser.climbingStyle]);
    setEditWeakPoints([...currentUser.weakPoints]);
    setShowEditModal(true);
  };

  const toggleStyle = (style: string) => {
    setEditStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleWeakPoint = (wp: string) => {
    setEditWeakPoints(prev =>
      prev.includes(wp) ? prev.filter(w => w !== wp) : [...prev, wp]
    );
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    const newArmSpan = Number(editArmSpan) || currentUser.armSpan;
    const newHeight = Number(editHeight) || currentUser.height;

    updateUserProfile({
      name: editName.trim(),
      height: newHeight,
      armSpan: newArmSpan,
      apeIndex: newArmSpan - newHeight,
      fingerStrength: editFinger,
      coreStrength: editCore,
      pullStrength: editPull,
      dynamicAbility: editDynamic,
      maxGrade: editMaxGrade,
      redpointGrade: editRedpoint,
      onSightGrade: editOnsight,
      climbingStyle: editStyles as any,
      weakPoints: editWeakPoints
    });

    console.log('[Match] Profile updated, recalculating matches...');
    Taro.showToast({ title: '档案已更新', icon: 'success' });
    setShowEditModal(false);
  };

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

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>难度匹配</Text>
        <Text className={styles.pageSubtitle}>根据您的体能档案智能推荐线路</Text>
      </View>

      <UserProfileCard profile={currentUser} onEdit={openEditModal} />

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

      {showEditModal && (
        <View className={styles.editModal} onClick={() => setShowEditModal(false)}>
          <ScrollView
            className={styles.editModalContent}
            onClick={e => e.stopPropagation && (e as any).stopPropagation()}
          >
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>编辑个人档案</Text>
              <View className={styles.closeBtn} onClick={() => setShowEditModal(false)}>
                <Text className={styles.closeBtnText}>×</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>昵称</Text>
              <Input
                className={styles.formInput}
                placeholder="输入昵称"
                placeholderStyle="color: #86909C"
                value={editName}
                onInput={e => setEditName(e.detail.value)}
              />
            </View>

            <View className={styles.formRow}>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>身高 (cm)</Text>
                <Input
                  className={styles.formInput}
                  type="number"
                  value={String(editHeight)}
                  onInput={e => setEditHeight(Number(e.detail.value) || 170)}
                />
              </View>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>臂展 (cm)</Text>
                <Input
                  className={styles.formInput}
                  type="number"
                  value={String(editArmSpan)}
                  onInput={e => setEditArmSpan(Number(e.detail.value) || 170)}
                />
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                指力：{editFinger}/10
              </Text>
              <View className={styles.sliderRow}>
                <Slider
                  className={styles.slider}
                  min={1}
                  max={10}
                  value={editFinger}
                  activeColor="#FF6B35"
                  backgroundColor="#3A3F4B"
                  blockColor="#FF6B35"
                  onChange={e => setEditFinger(e.detail.value)}
                />
                <Text className={styles.sliderValue}>{editFinger}</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                核心：{editCore}/10
              </Text>
              <View className={styles.sliderRow}>
                <Slider
                  className={styles.slider}
                  min={1}
                  max={10}
                  value={editCore}
                  activeColor="#52C41A"
                  backgroundColor="#3A3F4B"
                  blockColor="#52C41A"
                  onChange={e => setEditCore(e.detail.value)}
                />
                <Text className={styles.sliderValue}>{editCore}</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                拉力：{editPull}/10
              </Text>
              <View className={styles.sliderRow}>
                <Slider
                  className={styles.slider}
                  min={1}
                  max={10}
                  value={editPull}
                  activeColor="#1890FF"
                  backgroundColor="#3A3F4B"
                  blockColor="#1890FF"
                  onChange={e => setEditPull(e.detail.value)}
                />
                <Text className={styles.sliderValue}>{editPull}</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                动态：{editDynamic}/10
              </Text>
              <View className={styles.sliderRow}>
                <Slider
                  className={styles.slider}
                  min={1}
                  max={10}
                  value={editDynamic}
                  activeColor="#FAAD14"
                  backgroundColor="#3A3F4B"
                  blockColor="#FAAD14"
                  onChange={e => setEditDynamic(e.detail.value)}
                />
                <Text className={styles.sliderValue}>{editDynamic}</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>最高能力难度</Text>
              <View className={styles.gradeSelector}>
                {ALL_GRADES.map(g => (
                  <View
                    key={g}
                    className={classnames(styles.gradeOption, editMaxGrade === g && styles.selected)}
                    onClick={() => setEditMaxGrade(g)}
                  >
                    <Text className={styles.gradeOptionText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>红点难度</Text>
              <View className={styles.gradeSelector}>
                {ALL_GRADES.map(g => (
                  <View
                    key={g}
                    className={classnames(styles.gradeOption, editRedpoint === g && styles.selected)}
                    onClick={() => setEditRedpoint(g)}
                  >
                    <Text className={styles.gradeOptionText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>攀爬风格（可多选）</Text>
              <View className={styles.tagSelector}>
                {CLIMBING_STYLES.map(s => (
                  <View
                    key={s.value}
                    className={classnames(styles.tagOption, editStyles.includes(s.value) && styles.selected)}
                    onClick={() => toggleStyle(s.value)}
                  >
                    <Text className={styles.tagOptionText}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>待提升项（可多选）</Text>
              <View className={styles.tagSelector}>
                {WEAK_POINT_OPTIONS.map(wp => (
                  <View
                    key={wp}
                    className={classnames(styles.tagOption, editWeakPoints.includes(wp) && styles.selected)}
                    onClick={() => toggleWeakPoint(wp)}
                  >
                    <Text className={styles.tagOptionText}>{wp}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.submitBtn} onClick={handleSaveProfile}>
              <Text className={styles.submitBtnText}>保存档案并重新计算</Text>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default MatchPage;

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Textarea, Slider, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useBoulderingStore } from '@/store/useBoulderingStore';
import { Route, DIFFICULTY_COLORS } from '@/types/bouldering';
import {
  MovementBreakdown,
  MovementStep,
  ForceDirection,
  MovementType,
  BalanceState,
  InjuryRisk,
  FORCE_DIRECTION_LABELS,
  MOVEMENT_TYPE_LABELS,
  BALANCE_STATE_LABELS,
  INJURY_RISK_LABELS
} from '@/types/movement';
import { calculateTorque, assessInjuryRisk } from '@/utils/physics';
import RouteCard from '@/components/RouteCard';
import MovementStepComponent from '@/components/MovementStep';
import styles from './index.module.scss';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const AnalysisPage: React.FC = () => {
  const { routes, movements, addMovement, currentUser } = useBoulderingStore();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(routes[0] || null);
  const [showRouteList, setShowRouteList] = useState(false);
  const [showNewMovement, setShowNewMovement] = useState(false);
  const [steps, setSteps] = useState<MovementStep[]>([]);
  const [showStepForm, setShowStepForm] = useState(false);
  const [editingStep, setEditingStep] = useState<Partial<MovementStep> | null>(null);

  const currentMovement = useMemo<MovementBreakdown | null>(() => {
    if (!selectedRoute) return null;
    return movements.find(m => m.routeId === selectedRoute.id) || null;
  }, [selectedRoute, movements]);

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    setShowRouteList(false);
    console.log('[Analysis] Selected route:', route.name);
  };

  const handleOpenNewMovement = () => {
    setSteps([]);
    setShowNewMovement(true);
  };

  const handleAddStep = () => {
    setEditingStep({
      stepIndex: steps.length + 1,
      description: '',
      centerOfGravityShift: { x: 0, y: 0 },
      primaryForceDirection: 'up',
      forceMagnitude: 50,
      movementType: 'static',
      torque: calculateTorque(5, currentUser.armSpan / 200, currentUser.weight || 70),
      balanceState: 'stable',
      injuryRisk: 'low',
      isCrux: false
    });
    setShowStepForm(true);
  };

  const handleEditStep = (step: MovementStep) => {
    setEditingStep({ ...step });
    setShowStepForm(true);
  };

  const handleDeleteStep = (stepId: string) => {
    const newSteps = steps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, stepIndex: i + 1 }));
    setSteps(newSteps);
  };

  const handleSaveStep = () => {
    if (!editingStep || !editingStep.description?.trim()) {
      Taro.showToast({ title: '请填写动作描述', icon: 'none' });
      return;
    }

    const torque = editingStep.torque || calculateTorque(5, currentUser.armSpan / 200, currentUser.weight || 70);
    const injuryAssessment = assessInjuryRisk(
      torque,
      editingStep.dynamicSuccessRate || 80,
      currentUser.fingerStrength,
      editingStep.movementType === 'dyno'
    );

    const step: MovementStep = {
      id: editingStep.id || generateId(),
      stepIndex: editingStep.stepIndex || steps.length + 1,
      description: editingStep.description,
      leftHand: editingStep.leftHand,
      rightHand: editingStep.rightHand,
      leftFoot: editingStep.leftFoot,
      rightFoot: editingStep.rightFoot,
      centerOfGravityShift: editingStep.centerOfGravityShift || { x: 0, y: 0 },
      primaryForceDirection: editingStep.primaryForceDirection || 'up',
      forceMagnitude: editingStep.forceMagnitude || 50,
      movementType: editingStep.movementType || 'static',
      torque,
      dynamicSuccessRate: editingStep.dynamicSuccessRate,
      balanceState: editingStep.balanceState || 'stable',
      footSequenceImpact: editingStep.footSequenceImpact,
      injuryRisk: injuryAssessment.risk,
      injuryWarning: injuryAssessment.warning,
      isCrux: editingStep.isCrux || false,
      notes: editingStep.notes
    };

    if (editingStep.id) {
      const newSteps = steps.map(s => s.id === editingStep.id ? step : s);
      setSteps(newSteps);
    } else {
      setSteps([...steps, step]);
    }

    setShowStepForm(false);
    setEditingStep(null);
  };

  const handleSaveMovement = () => {
    if (!selectedRoute) {
      Taro.showToast({ title: '请先选择线路', icon: 'none' });
      return;
    }
    if (steps.length === 0) {
      Taro.showToast({ title: '请至少添加一个步骤', icon: 'none' });
      return;
    }

    const cruxSteps = steps.filter(s => s.isCrux).map(s => `第${s.stepIndex}步：${s.description}`);
    const criticalRisks = steps
      .filter(s => s.injuryRisk === 'high' || s.injuryRisk === 'critical')
      .map(s => `第${s.stepIndex}步：${s.injuryWarning || s.description}`);

    const avgDifficulty = steps.reduce((sum, s) => sum + s.torque.totalStressScore, 0) / steps.length / 10;
    const estimatedGradeNum = Math.min(9, Math.max(0, Math.round(avgDifficulty)));
    const estimatedGrade = `V${estimatedGradeNum}`;

    const movement: MovementBreakdown = {
      id: generateId(),
      routeId: selectedRoute.id,
      routeName: selectedRoute.name,
      steps: steps.sort((a, b) => a.stepIndex - b.stepIndex),
      overallDifficultyScore: avgDifficulty * 10,
      estimatedGrade,
      cruxSteps,
      criticalInjuryRisks: criticalRisks,
      footSequenceAnalysis: steps.length > 0 
        ? `本线路共${steps.length}个动作，建议按照标注顺序踩踏脚点以保持身体平衡。` 
        : ''
    };

    addMovement(movement);
    setShowNewMovement(false);
    setSteps([]);
    Taro.showToast({ title: '动作拆解保存成功', icon: 'success' });
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
            <View className={`${styles.actionBtn} ${styles.primary}`} onClick={handleOpenNewMovement}>
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

          <View className={styles.actionsBar} style={{ marginTop: 32 }}>
            <View className={`${styles.actionBtn} ${styles.primary}`} onClick={handleOpenNewMovement}>
              <Text className={styles.actionBtnText}>重新拆解此线路</Text>
            </View>
          </View>
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

      {showNewMovement && (
        <View className={styles.modalOverlay} onClick={() => setShowNewMovement(false)}>
          <ScrollView
            className={styles.modalContent}
            onClick={e => e.stopPropagation && (e as any).stopPropagation()}
          >
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>新建动作拆解</Text>
              <View className={styles.closeBtn} onClick={() => setShowNewMovement(false)}>
                <Text className={styles.closeBtnText}>关闭</Text>
              </View>
            </View>

            <View className={styles.formSection}>
              <Text className={styles.formSectionTitle}>
                线路：{selectedRoute?.name || '未选择'}
              </Text>

              <View className={styles.stepsListHeader}>
                <Text className={styles.stepsListTitle}>动作步骤 ({steps.length})</Text>
                <View className={styles.addStepBtn} onClick={handleAddStep}>
                  <Text className={styles.addStepBtnText}>+ 添加步骤</Text>
                </View>
              </View>

              {steps.length === 0 ? (
                <View className={styles.emptySteps}>
                  <Text className={styles.emptyStepsText}>暂无步骤，点击上方按钮添加</Text>
                </View>
              ) : (
                <View className={styles.stepsList}>
                  {steps.map(step => (
                    <View key={step.id} className={styles.stepListItem}>
                      <View className={styles.stepIndexBadge}>
                        <Text className={styles.stepIndexText}>{step.stepIndex}</Text>
                      </View>
                      <View className={styles.stepListItemContent}>
                        <Text className={styles.stepListItemDesc}>{step.description}</Text>
                        <View className={styles.stepListItemMeta}>
                          <Text className={styles.stepListItemMetaText}>
                            {MOVEMENT_TYPE_LABELS[step.movementType]} · 
                            发力: {step.forceMagnitude}% · 
                            风险: {INJURY_RISK_LABELS[step.injuryRisk]}
                          </Text>
                        </View>
                      </View>
                      <View className={styles.stepListItemActions}>
                        <View className={styles.stepEditBtn} onClick={() => handleEditStep(step)}>
                          <Text className={styles.stepEditBtnText}>编辑</Text>
                        </View>
                        <View className={styles.stepDeleteBtn} onClick={() => handleDeleteStep(step.id)}>
                          <Text className={styles.stepDeleteBtnText}>删除</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View className={styles.modalFooter}>
              <View className={`${styles.actionBtn} ${styles.secondary}`} onClick={() => setShowNewMovement(false)}>
                <Text className={styles.actionBtnText}>取消</Text>
              </View>
              <View className={`${styles.actionBtn} ${styles.primary}`} onClick={handleSaveMovement}>
                <Text className={styles.actionBtnText}>保存动作拆解</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {showStepForm && editingStep && (
        <View className={styles.modalOverlay} onClick={() => setShowStepForm(false)}>
          <ScrollView
            className={styles.modalContent}
            onClick={e => e.stopPropagation && (e as any).stopPropagation()}
          >
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>
                {editingStep.id ? '编辑步骤' : `第${editingStep.stepIndex}步`}
              </Text>
              <View className={styles.closeBtn} onClick={() => setShowStepForm(false)}>
                <Text className={styles.closeBtnText}>关闭</Text>
              </View>
            </View>

            <View className={styles.formSection}>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>动作描述 *</Text>
                <Textarea
                  className={styles.textarea}
                  placeholder="例如：左手抓大开口点，右脚踩高点"
                  value={editingStep.description || ''}
                  onInput={e => setEditingStep({ ...editingStep, description: e.detail.value })}
                />
              </View>

              <View className={styles.formRow}>
                <View className={styles.formGroup} style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>左手位置</Text>
                  <Input
                    className={styles.input}
                    placeholder="如：大开口点"
                    value={editingStep.leftHand || ''}
                    onInput={e => setEditingStep({ ...editingStep, leftHand: e.detail.value })}
                  />
                </View>
                <View className={styles.formGroup} style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>右手位置</Text>
                  <Input
                    className={styles.input}
                    placeholder="如：小捏点"
                    value={editingStep.rightHand || ''}
                    onInput={e => setEditingStep({ ...editingStep, rightHand: e.detail.value })}
                  />
                </View>
              </View>

              <View className={styles.formRow}>
                <View className={styles.formGroup} style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>左脚位置</Text>
                  <Input
                    className={styles.input}
                    placeholder="如：高脚点"
                    value={editingStep.leftFoot || ''}
                    onInput={e => setEditingStep({ ...editingStep, leftFoot: e.detail.value })}
                  />
                </View>
                <View className={styles.formGroup} style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>右脚位置</Text>
                  <Input
                    className={styles.input}
                    placeholder="如：摩擦点"
                    value={editingStep.rightFoot || ''}
                    onInput={e => setEditingStep({ ...editingStep, rightFoot: e.detail.value })}
                  />
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>
                  重心转移：X偏移 {editingStep.centerOfGravityShift?.x || 0}cm · 
                  Y偏移 {editingStep.centerOfGravityShift?.y || 0}cm
                </Text>
                <View className={styles.sliderRow}>
                  <Text className={styles.sliderLabel}>X轴(左右)</Text>
                  <Slider
                    className={styles.slider}
                    min={-50}
                    max={50}
                    value={editingStep.centerOfGravityShift?.x || 0}
                    activeColor="#FF6B35"
                    backgroundColor="rgba(255,255,255,0.1)"
                    blockColor="#FF6B35"
                    onChange={e => setEditingStep({
                      ...editingStep,
                      centerOfGravityShift: {
                        x: e.detail.value,
                        y: editingStep.centerOfGravityShift?.y || 0
                      }
                    })}
                  />
                </View>
                <View className={styles.sliderRow}>
                  <Text className={styles.sliderLabel}>Y轴(上下)</Text>
                  <Slider
                    className={styles.slider}
                    min={-50}
                    max={50}
                    value={editingStep.centerOfGravityShift?.y || 0}
                    activeColor="#FF6B35"
                    backgroundColor="rgba(255,255,255,0.1)"
                    blockColor="#FF6B35"
                    onChange={e => setEditingStep({
                      ...editingStep,
                      centerOfGravityShift: {
                        x: editingStep.centerOfGravityShift?.x || 0,
                        y: e.detail.value
                      }
                    })}
                  />
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>发力方向</Text>
                <View className={styles.tagGrid}>
                  {(Object.keys(FORCE_DIRECTION_LABELS) as ForceDirection[]).map(dir => (
                    <View
                      key={dir}
                      className={`${styles.tagItem} ${editingStep.primaryForceDirection === dir ? styles.tagItemActive : ''}`}
                      onClick={() => setEditingStep({ ...editingStep, primaryForceDirection: dir })}
                    >
                      <Text className={styles.tagItemText}>{FORCE_DIRECTION_LABELS[dir]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>发力强度：{editingStep.forceMagnitude || 50}%</Text>
                <Slider
                  className={styles.slider}
                  min={0}
                  max={100}
                  value={editingStep.forceMagnitude || 50}
                  activeColor="#FF6B35"
                  backgroundColor="rgba(255,255,255,0.1)"
                  blockColor="#FF6B35"
                  onChange={e => setEditingStep({ ...editingStep, forceMagnitude: e.detail.value })}
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>动作类型</Text>
                <View className={styles.tagGrid}>
                  {(Object.keys(MOVEMENT_TYPE_LABELS) as MovementType[]).map(type => (
                    <View
                      key={type}
                      className={`${styles.tagItem} ${editingStep.movementType === type ? styles.tagItemActive : ''}`}
                      onClick={() => setEditingStep({ ...editingStep, movementType: type })}
                    >
                      <Text className={styles.tagItemText}>{MOVEMENT_TYPE_LABELS[type]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {editingStep.movementType === 'dyno' || editingStep.movementType === 'deadpoint' ? (
                <View className={styles.formGroup}>
                  <Text className={styles.formLabel}>
                    动态成功率：{editingStep.dynamicSuccessRate || 70}%
                  </Text>
                  <Slider
                    className={styles.slider}
                    min={5}
                    max={95}
                    value={editingStep.dynamicSuccessRate || 70}
                    activeColor="#FF6B35"
                    backgroundColor="rgba(255,255,255,0.1)"
                    blockColor="#FF6B35"
                    onChange={e => setEditingStep({ ...editingStep, dynamicSuccessRate: e.detail.value })}
                  />
                </View>
              ) : null}

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>平衡状态</Text>
                <View className={styles.tagGrid}>
                  {(Object.keys(BALANCE_STATE_LABELS) as BalanceState[]).map(state => (
                    <View
                      key={state}
                      className={`${styles.tagItem} ${editingStep.balanceState === state ? styles.tagItemActive : ''}`}
                      onClick={() => setEditingStep({ ...editingStep, balanceState: state })}
                    >
                      <Text className={styles.tagItemText}>{BALANCE_STATE_LABELS[state]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>脚点序列影响</Text>
                <Textarea
                  className={styles.textarea}
                  placeholder="例如：先踩左脚再踩右脚更稳定"
                  value={editingStep.footSequenceImpact || ''}
                  onInput={e => setEditingStep({ ...editingStep, footSequenceImpact: e.detail.value })}
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>备注说明</Text>
                <Textarea
                  className={styles.textarea}
                  placeholder="其他需要注意的技巧或要点"
                  value={editingStep.notes || ''}
                  onInput={e => setEditingStep({ ...editingStep, notes: e.detail.value })}
                />
              </View>

              <View className={styles.formRow}>
                <Text className={styles.formLabel}>标记为卡点动作</Text>
                <Switch
                  checked={editingStep.isCrux || false}
                  color="#FF6B35"
                  onChange={e => setEditingStep({ ...editingStep, isCrux: e.detail.value })}
                />
              </View>
            </View>

            <View className={styles.modalFooter}>
              <View className={`${styles.actionBtn} ${styles.secondary}`} onClick={() => setShowStepForm(false)}>
                <Text className={styles.actionBtnText}>取消</Text>
              </View>
              <View className={`${styles.actionBtn} ${styles.primary}`} onClick={handleSaveStep}>
                <Text className={styles.actionBtnText}>保存步骤</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default AnalysisPage;

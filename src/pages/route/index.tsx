import React, { useState, useCallback } from 'react';
import { View, Text, Input, Slider, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useBoulderingStore } from '@/store/useBoulderingStore';
import {
  Route,
  HoldPoint,
  HoldShape,
  HoldOrientation,
  HoldType,
  DifficultyGrade,
  HOLD_SHAPE_LABELS,
  HOLD_ORIENTATION_LABELS
} from '@/types/bouldering';
import RouteCard from '@/components/RouteCard';
import { calculateHoldDifficulty, estimateRouteGrade, checkGradeConsistency } from '@/utils/difficulty';
import styles from './index.module.scss';

const ALL_GRADES: DifficultyGrade[] = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9'];
const HOLD_SHAPES: HoldShape[] = ['jug', 'crimp', 'sloper', 'pocket', 'pinch', 'edge', 'gastron'];
const HOLD_ORIENTATIONS: HoldOrientation[] = ['up', 'down', 'left', 'right', 'slantLeft', 'slantRight', 'undercling'];
const HOLD_TYPES: { value: HoldType; label: string }[] = [
  { value: 'start', label: '起点' },
  { value: 'middle', label: '中间' },
  { value: 'foot', label: '脚点' },
  { value: 'finish', label: '终点' }
];
const AVAILABLE_TAGS = ['powerful', 'technical', 'dynamic', 'balance', 'endurance', 'crimp', 'sloper', 'beginner'];

const RoutePage: React.FC = () => {
  const { routes, addRoute, updateRoute } = useBoulderingStore();
  const [showForm, setShowForm] = useState(false);
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState<DifficultyGrade>('V3');
  const [formSetter, setFormSetter] = useState('');
  const [formGym, setFormGym] = useState('岩舞空间');
  const [formAngle, setFormAngle] = useState(15);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formHolds, setFormHolds] = useState<HoldPoint[]>([]);
  const [holdBeingEdited, setHoldBeingEdited] = useState<number | null>(null);

  const filteredRoutes = filterGrade === 'all'
    ? routes
    : routes.filter(r => r.grade === filterGrade);

  const openNewForm = useCallback(() => {
    setEditingRoute(null);
    setFormName('');
    setFormGrade('V3');
    setFormSetter('');
    setFormGym('岩舞空间');
    setFormAngle(15);
    setFormTags([]);
    setFormHolds([
      { id: 's1', name: 'S1', shape: 'jug', orientation: 'up', type: 'start', x: 20, y: 60, size: 10, holdDifficulty: 1 },
      { id: 's2', name: 'S2', shape: 'jug', orientation: 'up', type: 'start', x: 70, y: 60, size: 10, holdDifficulty: 1 }
    ]);
    setShowForm(true);
  }, []);

  const openEditForm = useCallback((route: Route) => {
    setEditingRoute(route);
    setFormName(route.name);
    setFormGrade(route.grade);
    setFormSetter(route.setter);
    setFormGym(route.gymName);
    setFormAngle(route.wallAngle);
    setFormTags(route.tags || []);
    setFormHolds(route.holds.map(h => ({ ...h })));
    setShowForm(true);
  }, []);

  const addHold = useCallback(() => {
    const index = formHolds.length + 1;
    const newHold: HoldPoint = {
      id: `hold-${Date.now()}`,
      name: `M${index}`,
      shape: 'edge',
      orientation: 'up',
      type: 'middle',
      x: 50,
      y: 100 + index * 30,
      size: 5,
      holdDifficulty: calculateHoldDifficulty('edge', 'up', 5)
    };
    setFormHolds(prev => [...prev, newHold]);
    setHoldBeingEdited(formHolds.length);
    console.log('[Route] Added new hold, total holds:', formHolds.length + 1);
  }, [formHolds]);

  const updateHold = useCallback((index: number, updates: Partial<HoldPoint>) => {
    setFormHolds(prev => prev.map((hold, i) => {
      if (i !== index) return hold;
      const updated = { ...hold, ...updates };
      if (updates.shape || updates.orientation || updates.size !== undefined) {
        updated.holdDifficulty = calculateHoldDifficulty(
          updates.shape || hold.shape,
          updates.orientation || hold.orientation,
          updates.size !== undefined ? updates.size : hold.size
        );
      }
      return updated;
    }));
  }, []);

  const removeHold = useCallback((index: number) => {
    setFormHolds(prev => prev.filter((_, i) => i !== index));
    if (holdBeingEdited === index) setHoldBeingEdited(null);
  }, [holdBeingEdited]);

  const toggleTag = useCallback((tag: string) => {
    setFormTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const tempRoute: Route = {
    id: 'temp',
    name: formName || '待命名线路',
    grade: formGrade,
    setter: formSetter,
    gymName: formGym,
    wallAngle: formAngle,
    createdAt: new Date().toISOString().split('T')[0],
    holds: formHolds,
    tags: formTags
  };
  const calculatedGrade = estimateRouteGrade(tempRoute);
  const gradeConsistency = checkGradeConsistency(formGrade, calculatedGrade);

  const handleSubmit = useCallback(() => {
    if (!formName.trim()) {
      Taro.showToast({ title: '请输入线路名称', icon: 'none' });
      return;
    }
    if (formHolds.length < 2) {
      Taro.showToast({ title: '至少需要2个岩点', icon: 'none' });
      return;
    }

    const routeData: Route = {
      id: editingRoute?.id || `route-${Date.now()}`,
      name: formName.trim(),
      grade: formGrade,
      setter: formSetter.trim() || '匿名',
      gymName: formGym.trim(),
      wallAngle: formAngle,
      createdAt: editingRoute?.createdAt || new Date().toISOString().split('T')[0],
      holds: formHolds.map((h, i) => ({
        ...h,
        holdDifficulty: h.holdDifficulty || calculateHoldDifficulty(h.shape, h.orientation, h.size)
      })),
      tags: formTags,
      description: '',
      calculatedGrade,
      gradeConsistency
    };

    if (editingRoute) {
      updateRoute(editingRoute.id, routeData);
    } else {
      addRoute(routeData);
    }

    console.log('[Route] Saved route:', routeData.name, 'Grade consistency:', gradeConsistency);
    Taro.showToast({ title: editingRoute ? '更新成功' : '创建成功', icon: 'success' });
    setShowForm(false);
  }, [formName, formHolds, formGrade, formSetter, formGym, formAngle, formTags, calculatedGrade, gradeConsistency, editingRoute, addRoute, updateRoute]);

  const consistencyInfo = {
    excellent: { label: '评级精准', color: '#52C41A' },
    good: { label: '评级合理', color: '#1890FF' },
    fair: { label: '评级偏差', color: '#FAAD14' },
    poor: { label: '评级不准', color: '#F5222D' }
  }[gradeConsistency];

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>线路录入</Text>
        <Text className={styles.pageSubtitle}>管理和配置所有抱石线路</Text>
      </View>

      <View className={styles.filterBar}>
        <View
          className={classnames(styles.filterTag, filterGrade === 'all' && styles.active)}
          onClick={() => setFilterGrade('all')}
        >
          <Text className={styles.filterTagText}>全部</Text>
        </View>
        {ALL_GRADES.slice(0, 8).map(grade => (
          <View
            key={grade}
            className={classnames(styles.filterTag, filterGrade === grade && styles.active)}
            onClick={() => setFilterGrade(grade)}
          >
            <Text className={styles.filterTagText}>{grade}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY>
        {filteredRoutes.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🧗</Text>
            <Text className={styles.emptyText}>暂无线路，点击右下角添加</Text>
          </View>
        ) : (
          filteredRoutes.map(route => (
            <RouteCard
              key={route.id}
              route={route}
              onClick={() => openEditForm(route)}
            />
          ))
        )}
      </ScrollView>

      <View className={styles.fab} onClick={openNewForm}>
        <Text className={styles.fabText}>+</Text>
      </View>

      {showForm && (
        <View className={styles.formModal} onClick={() => setShowForm(false)}>
          <ScrollView
            className={styles.formContent}
            scrollY
            onClick={e => e.stopPropagation && (e as any).stopPropagation()}
          >
            <View className={styles.formHeader}>
              <Text className={styles.formTitle}>
                {editingRoute ? '编辑线路' : '新增线路'}
              </Text>
              <View className={styles.closeBtn} onClick={() => setShowForm(false)}>
                <Text className={styles.closeBtnText}>×</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>线路名称</Text>
              <Input
                className={styles.formInput}
                placeholder="输入线路名称"
                placeholderStyle="color: #86909C"
                value={formName}
                onInput={e => setFormName(e.detail.value)}
              />
            </View>

            <View className={styles.formRow}>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>定线员</Text>
                <Input
                  className={styles.formInput}
                  placeholder="输入定线员"
                  placeholderStyle="color: #86909C"
                  value={formSetter}
                  onInput={e => setFormSetter(e.detail.value)}
                />
              </View>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>攀岩馆</Text>
                <Input
                  className={styles.formInput}
                  placeholder="输入场馆名"
                  placeholderStyle="color: #86909C"
                  value={formGym}
                  onInput={e => setFormGym(e.detail.value)}
                />
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>难度等级</Text>
              <View className={styles.gradeSelector}>
                {ALL_GRADES.map(g => (
                  <View
                    key={g}
                    className={classnames(styles.gradeOption, formGrade === g && styles.selected)}
                    onClick={() => setFormGrade(g)}
                  >
                    <Text className={styles.gradeOptionText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>岩壁角度：{formAngle}°</Text>
              <View className={styles.sliderRow}>
                <Slider
                  className={styles.slider}
                  min={0}
                  max={60}
                  value={formAngle}
                  activeColor="#FF6B35"
                  backgroundColor="#3A3F4B"
                  blockColor="#FF6B35"
                  onChange={e => setFormAngle(e.detail.value)}
                />
                <Text className={styles.sliderValue}>{formAngle}°</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>线路标签</Text>
              <View className={styles.tagSelector}>
                {AVAILABLE_TAGS.map(tag => (
                  <View
                    key={tag}
                    className={classnames(styles.tagOption, formTags.includes(tag) && styles.selected)}
                    onClick={() => toggleTag(tag)}
                  >
                    <Text className={styles.tagOptionText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.holdsSection}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>岩点配置 ({formHolds.length})</Text>
                <View className={styles.addHoldBtn} onClick={addHold}>
                  <Text className={styles.addHoldBtnText}>+ 添加岩点</Text>
                </View>
              </View>

              <View className={styles.holdList}>
                {formHolds.map((hold, index) => (
                  <View key={hold.id}>
                    <View className={styles.holdEditor}>
                      <View className={styles.holdEditorHeader}>
                        <Text className={styles.holdEditorTitle}>
                          岩点 {index + 1}：{hold.name}
                        </Text>
                        <View className={styles.deleteHoldBtn} onClick={() => removeHold(index)}>
                          <Text className={styles.deleteHoldBtnText}>删除</Text>
                        </View>
                      </View>

                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>岩点名称</Text>
                        <Input
                          className={styles.formInput}
                          value={hold.name}
                          onInput={e => updateHold(index, { name: e.detail.value })}
                        />
                      </View>

                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>岩点类型</Text>
                        <View className={styles.tagSelector}>
                          {HOLD_TYPES.map(ht => (
                            <View
                              key={ht.value}
                              className={classnames(styles.tagOption, hold.type === ht.value && styles.selected)}
                              onClick={() => updateHold(index, { type: ht.value })}
                            >
                              <Text className={styles.tagOptionText}>{ht.label}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>岩点形状</Text>
                        <View className={styles.selectorGrid}>
                          {HOLD_SHAPES.map(shape => (
                            <View
                              key={shape}
                              className={classnames(styles.selectorItem, hold.shape === shape && styles.selected)}
                              onClick={() => updateHold(index, { shape })}
                            >
                              <Text className={styles.selectorItemText}>{HOLD_SHAPE_LABELS[shape]}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>岩点朝向</Text>
                        <View className={styles.selectorGrid}>
                          {HOLD_ORIENTATIONS.map(ori => (
                            <View
                              key={ori}
                              className={classnames(styles.selectorItem, hold.orientation === ori && styles.selected)}
                              onClick={() => updateHold(index, { orientation: ori })}
                            >
                              <Text className={styles.selectorItemText}>{HOLD_ORIENTATION_LABELS[ori]}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      <View className={styles.formRow}>
                        <View className={styles.formGroup}>
                          <Text className={styles.formLabel}>位置 X</Text>
                          <Input
                            className={styles.formInput}
                            type="number"
                            value={String(hold.x)}
                            onInput={e => updateHold(index, { x: Number(e.detail.value) })}
                          />
                        </View>
                        <View className={styles.formGroup}>
                          <Text className={styles.formLabel}>位置 Y</Text>
                          <Input
                            className={styles.formInput}
                            type="number"
                            value={String(hold.y)}
                            onInput={e => updateHold(index, { y: Number(e.detail.value) })}
                          />
                        </View>
                      </View>

                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>岩点大小：{hold.size}</Text>
                        <View className={styles.sliderRow}>
                          <Slider
                            className={styles.slider}
                            min={1}
                            max={12}
                            value={hold.size}
                            activeColor="#FF6B35"
                            backgroundColor="#3A3F4B"
                            blockColor="#FF6B35"
                            onChange={e => updateHold(index, { size: e.detail.value })}
                          />
                          <Text className={styles.sliderValue}>{hold.size}</Text>
                        </View>
                        <Text className={styles.formLabel} style={{ marginTop: 16 }}>
                          岩点难度：{hold.holdDifficulty.toFixed(1)} / 10
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.difficultyResult}>
              <Text className={styles.difficultyResultTitle}>🧮 系统难度校验</Text>
              <View className={styles.difficultyRow}>
                <Text className={styles.difficultyLabel}>设定难度</Text>
                <Text className={styles.difficultyValue}>{formGrade}</Text>
              </View>
              <View className={styles.difficultyRow}>
                <Text className={styles.difficultyLabel}>系统计算</Text>
                <Text className={styles.difficultyValue}>{calculatedGrade}</Text>
              </View>
              <View className={styles.difficultyRow}>
                <Text className={styles.difficultyLabel}>一致性</Text>
                <View className={styles.consistencyBadge} style={{ backgroundColor: consistencyInfo.color }}>
                  <Text className={styles.consistencyBadgeText}>{consistencyInfo.label}</Text>
                </View>
              </View>
            </View>

            <View className={styles.submitBtn} onClick={handleSubmit}>
              <Text className={styles.submitBtnText}>
                {editingRoute ? '保存修改' : '创建线路'}
              </Text>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default RoutePage;

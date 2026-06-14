import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Slider } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useBoulderingStore } from '@/store/useBoulderingStore';
import {
  TrainingLogEntry,
  AttemptStatus,
  FailPointCategory,
  ATTEMPT_STATUS_LABELS,
  FAIL_CATEGORY_LABELS
} from '@/types/training';
import LogEntryCard from '@/components/LogEntryCard';
import DifficultyBadge from '@/components/DifficultyBadge';
import styles from './index.module.scss';

const STATUS_OPTIONS: { value: AttemptStatus; label: string }[] = [
  { value: 'flash', label: 'Flash' },
  { value: 'send', label: '完攀' },
  { value: 'project', label: 'Project' },
  { value: 'partial', label: '部分完成' },
  { value: 'fail', label: '失败' }
];

const FAIL_CATEGORIES: { value: FailPointCategory; label: string }[] = [
  { value: 'power', label: '力量不足' },
  { value: 'finger', label: '指力不够' },
  { value: 'technique', label: '技术问题' },
  { value: 'balance', label: '平衡问题' },
  { value: 'reach', label: '身高限制' },
  { value: 'endurance', label: '耐力不足' },
  { value: 'mental', label: '心理因素' },
  { value: 'other', label: '其他' }
];

type FilterType = 'all' | AttemptStatus;

const LogPage: React.FC = () => {
  const { trainingLogs, routes, addTrainingLog } = useBoulderingStore();
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');

  const [formRouteId, setFormRouteId] = useState('');
  const [formAttempts, setFormAttempts] = useState(1);
  const [formStatus, setFormStatus] = useState<AttemptStatus>('project');
  const [formCompletion, setFormCompletion] = useState(50);
  const [formFailPoint, setFormFailPoint] = useState('');
  const [formFailCategory, setFormFailCategory] = useState<FailPointCategory | ''>('');
  const [formNotes, setFormNotes] = useState('');
  const [formWarmup, setFormWarmup] = useState(6);
  const [formEnergy, setFormEnergy] = useState(6);
  const [formDuration, setFormDuration] = useState(20);

  const stats = useMemo(() => {
    const total = trainingLogs.length;
    const sends = trainingLogs.filter(l => l.status === 'flash' || l.status === 'send').length;
    const flashCount = trainingLogs.filter(l => l.status === 'flash').length;
    const sendRate = total > 0 ? Math.round((sends / total) * 100) : 0;
    const flashRate = total > 0 ? Math.round((flashCount / total) * 100) : 0;

    const grades = trainingLogs
      .filter(l => l.status === 'flash' || l.status === 'send')
      .map(l => {
        const num = parseInt(l.routeGrade.replace('V', ''));
        return isNaN(num) ? 0 : num;
      });
    const avgGrade = grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : 0;
    const maxGrade = grades.length > 0 ? Math.max(...grades) : 0;

    const categoryCounts: Record<string, number> = {};
    trainingLogs.forEach(log => {
      if (log.failCategory) {
        categoryCounts[log.failCategory] = (categoryCounts[log.failCategory] || 0) + 1;
      }
    });
    const topWeakCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ category: cat as FailPointCategory, count }));

    return { total, sendRate, flashRate, avgGrade, maxGrade, topWeakCategories };
  }, [trainingLogs]);

  const filteredLogs = useMemo(() => {
    if (filterType === 'all') return trainingLogs;
    return trainingLogs.filter(l => l.status === filterType);
  }, [trainingLogs, filterType]);

  const handleOpenForm = () => {
    setFormRouteId(routes[0]?.id || '');
    setFormAttempts(1);
    setFormStatus('project');
    setFormCompletion(50);
    setFormFailPoint('');
    setFormFailCategory('');
    setFormNotes('');
    setFormWarmup(6);
    setFormEnergy(6);
    setFormDuration(20);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formRouteId) {
      Taro.showToast({ title: '请选择线路', icon: 'none' });
      return;
    }

    const route = routes.find(r => r.id === formRouteId);
    if (!route) return;

    const isCompleted = formStatus === 'flash' || formStatus === 'send';

    const newLog: TrainingLogEntry = {
      id: `log-${Date.now()}`,
      routeId: formRouteId,
      routeName: route.name,
      routeGrade: route.grade,
      date: new Date().toISOString().split('T')[0],
      attempts: formAttempts,
      status: formStatus,
      completionPercent: isCompleted ? 100 : formCompletion,
      failPoint: !isCompleted && formFailPoint ? formFailPoint : undefined,
      failCategory: !isCompleted && formFailCategory ? formFailCategory : undefined,
      notes: formNotes || undefined,
      warmupQuality: formWarmup,
      energyLevel: formEnergy,
      durationMinutes: formDuration
    };

    addTrainingLog(newLog);
    console.log('[Log] Added training log:', newLog.routeName, newLog.status);
    Taro.showToast({ title: '记录已保存', icon: 'success' });
    setShowForm(false);
  };

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: '全部' },
    ...STATUS_OPTIONS
  ];

  const selectedRoute = routes.find(r => r.id === formRouteId);
  const isCompleted = formStatus === 'flash' || formStatus === 'send';

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>训练日志</Text>
        <Text className={styles.pageSubtitle}>记录每一次尝试，追踪你的攀岩成长</Text>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{stats.total}</Text>
          <Text className={styles.statLabel}>总训练次数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{stats.sendRate}%</Text>
          <Text className={styles.statLabel}>完攀率</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>V{stats.avgGrade}</Text>
          <Text className={styles.statLabel}>平均完攀难度</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>V{stats.maxGrade}</Text>
          <Text className={styles.statLabel}>最高完攀难度</Text>
        </View>
      </View>

      {stats.topWeakCategories.length > 0 && (
        <View className={styles.weaknessCard}>
          <Text className={styles.weaknessTitle}>📊 失败原因分析</Text>
          {stats.topWeakCategories.map(({ category, count }) => {
            const maxCount = Math.max(...stats.topWeakCategories.map(c => c.count));
            const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <View key={category} className={styles.weaknessBarRow}>
                <Text className={styles.weaknessName}>{FAIL_CATEGORY_LABELS[category]}</Text>
                <View className={styles.weaknessBar}>
                  <View className={styles.weaknessFill} style={{ width: `${percent}%` }} />
                </View>
                <Text className={styles.weaknessCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>📝 训练记录</Text>
      </View>

      <View className={styles.filterBar}>
        {filterOptions.map(opt => (
          <View
            key={opt.value}
            className={classnames(styles.filterTag, filterType === opt.value && styles.active)}
            onClick={() => setFilterType(opt.value)}
          >
            <Text className={styles.filterTagText}>{opt.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY>
        {filteredLogs.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📔</Text>
            <Text className={styles.emptyTitle}>暂无训练记录</Text>
            <Text className={styles.emptyText}>点击右下角开始记录你的训练</Text>
          </View>
        ) : (
          filteredLogs.map(log => (
            <LogEntryCard key={log.id} log={log} />
          ))
        )}
      </ScrollView>

      <View className={styles.fab} onClick={handleOpenForm}>
        <Text className={styles.fabText}>+</Text>
      </View>

      {showForm && (
        <View className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <ScrollView
            className={styles.modalContent}
            onClick={e => e.stopPropagation && (e as any).stopPropagation()}
          >
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>新增训练记录</Text>
              <View className={styles.closeBtn} onClick={() => setShowForm(false)}>
                <Text className={styles.closeBtnText}>×</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>选择线路</Text>
              <ScrollView scrollY style={{ maxHeight: 400 }}>
                {routes.map(route => (
                  <View
                    key={route.id}
                    className={classnames(styles.routeListItem, formRouteId === route.id && styles.selected)}
                    onClick={() => setFormRouteId(route.id)}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Text className={styles.routeListItemName}>{route.name}</Text>
                      <DifficultyBadge grade={route.grade} size="sm" showLabel={false} />
                    </View>
                    <Text className={{ fontSize: 24, color: '#86909C' }}>
                      {route.holds.length}点 · {route.wallAngle}°
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {selectedRoute && (
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>尝试次数</Text>
                <View className={styles.sliderRow}>
                  <Slider
                    className={styles.slider}
                    min={1}
                    max={20}
                    value={formAttempts}
                    activeColor="#FF6B35"
                    backgroundColor="#3A3F4B"
                    blockColor="#FF6B35"
                    onChange={e => setFormAttempts(e.detail.value)}
                  />
                  <Text className={styles.sliderValue}>{formAttempts}</Text>
                </View>
              </View>
            )}

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>完成状态</Text>
              <View className={styles.selectorRow}>
                {STATUS_OPTIONS.map(opt => (
                  <View
                    key={opt.value}
                    className={classnames(styles.selectorOption, formStatus === opt.value && styles.selected)}
                    onClick={() => setFormStatus(opt.value)}
                  >
                    <Text className={styles.selectorOptionText}>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {!isCompleted && (
              <>
                <View className={styles.formGroup}>
                  <Text className={styles.formLabel}>完成度</Text>
                  <View className={styles.sliderRow}>
                    <Slider
                      className={styles.slider}
                      min={0}
                      max={100}
                      value={formCompletion}
                      activeColor="#FF6B35"
                      backgroundColor="#3A3F4B"
                      blockColor="#FF6B35"
                      onChange={e => setFormCompletion(e.detail.value)}
                    />
                    <Text className={styles.sliderValue}>{formCompletion}%</Text>
                  </View>
                </View>

                <View className={styles.formGroup}>
                  <Text className={styles.formLabel}>失败点描述</Text>
                  <Input
                    className={styles.formInput}
                    placeholder="例如：第3步抓握不住"
                    placeholderStyle="color: #86909C"
                    value={formFailPoint}
                    onInput={e => setFormFailPoint(e.detail.value)}
                  />
                </View>

                <View className={styles.formGroup}>
                  <Text className={styles.formLabel}>失败原因分类</Text>
                  <View className={styles.selectorRow}>
                    {FAIL_CATEGORIES.map(opt => (
                      <View
                        key={opt.value}
                        className={classnames(styles.selectorOption, formFailCategory === opt.value && styles.selected)}
                        onClick={() => setFormFailCategory(opt.value)}
                      >
                        <Text className={styles.selectorOptionText}>{opt.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>热身质量：{formWarmup}/10</Text>
              <View className={styles.sliderRow}>
                <Slider
                  className={styles.slider}
                  min={1}
                  max={10}
                  value={formWarmup}
                  activeColor="#52C41A"
                  backgroundColor="#3A3F4B"
                  blockColor="#52C41A"
                  onChange={e => setFormWarmup(e.detail.value)}
                />
                <Text className={styles.sliderValue}>{formWarmup}</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>能量水平：{formEnergy}/10</Text>
              <View className={styles.sliderRow}>
                <Slider
                  className={styles.slider}
                  min={1}
                  max={10}
                  value={formEnergy}
                  activeColor="#1890FF"
                  backgroundColor="#3A3F4B"
                  blockColor="#1890FF"
                  onChange={e => setFormEnergy(e.detail.value)}
                />
                <Text className={styles.sliderValue}>{formEnergy}</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>训练时长：{formDuration} 分钟</Text>
              <View className={styles.sliderRow}>
                <Slider
                  className={styles.slider}
                  min={5}
                  max={120}
                  step={5}
                  value={formDuration}
                  activeColor="#FF6B35"
                  backgroundColor="#3A3F4B"
                  blockColor="#FF6B35"
                  onChange={e => setFormDuration(e.detail.value)}
                />
                <Text className={styles.sliderValue}>{formDuration}</Text>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>训练笔记</Text>
              <Input
                className={styles.formTextarea}
                placeholder="记录本次训练的感受和收获..."
                placeholderStyle="color: #86909C"
                value={formNotes}
                onInput={e => setFormNotes(e.detail.value)}
              />
            </View>

            <View className={styles.submitBtn} onClick={handleSubmit}>
              <Text className={styles.submitBtnText}>保存训练记录</Text>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default LogPage;

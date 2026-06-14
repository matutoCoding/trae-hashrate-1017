import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import { useBoulderingStore } from '@/store/useBoulderingStore';
import { MovementBeta, BetaStep } from '@/types/training';
import { Route } from '@/types/bouldering';
import BetaCard from '@/components/BetaCard';
import DifficultyBadge from '@/components/DifficultyBadge';
import RouteCard from '@/components/RouteCard';
import styles from './index.module.scss';

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
type BodyTypeFilter = 'all' | 'short' | 'average' | 'tall';
type StyleFilter = 'all' | 'power' | 'technique' | 'endurance' | 'dynamic';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const LibraryPage: React.FC = () => {
  const { betaLibrary, routes, addBeta, currentUser } = useBoulderingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [bodyTypeFilter, setBodyTypeFilter] = useState<BodyTypeFilter>('all');
  const [styleFilter, setStyleFilter] = useState<StyleFilter>('all');
  const [selectedBeta, setSelectedBeta] = useState<MovementBeta | null>(null);
  const [showNewBeta, setShowNewBeta] = useState(false);
  const [showRouteSelect, setShowRouteSelect] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [betaTitle, setBetaTitle] = useState('');
  const [betaTags, setBetaTags] = useState('');
  const [betaDifficulty, setBetaDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [betaBodyType, setBetaBodyType] = useState<('short' | 'average' | 'tall')[]>(['average']);
  const [betaStyle, setBetaStyle] = useState<('power' | 'technique' | 'endurance' | 'dynamic')[]>(['technique']);
  const [betaSteps, setBetaSteps] = useState<BetaStep[]>([]);
  const [betaOverallTips, setBetaOverallTips] = useState('');
  const [showStepForm, setShowStepForm] = useState(false);
  const [editingStep, setEditingStep] = useState<Partial<BetaStep> | null>(null);

  const filteredBetas = useMemo(() => {
    return betaLibrary.filter(beta => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = beta.title.toLowerCase().includes(q);
        const matchRoute = beta.routeName.toLowerCase().includes(q);
        const matchTag = beta.tags.some(t => t.toLowerCase().includes(q));
        const matchAuthor = beta.author.toLowerCase().includes(q);
        if (!matchName && !matchRoute && !matchTag && !matchAuthor) return false;
      }

      if (difficultyFilter !== 'all' && beta.difficulty !== difficultyFilter) return false;
      if (bodyTypeFilter !== 'all' && !beta.bodyType.includes(bodyTypeFilter)) return false;
      if (styleFilter !== 'all' && !beta.style.includes(styleFilter)) return false;

      return true;
    });
  }, [betaLibrary, searchQuery, difficultyFilter, bodyTypeFilter, styleFilter]);

  const difficultyOptions: { value: DifficultyFilter; label: string }[] = [
    { value: 'all', label: '全部难度' },
    { value: 'beginner', label: '入门' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' },
    { value: 'expert', label: '专家' }
  ];

  const bodyTypeOptions: { value: BodyTypeFilter; label: string }[] = [
    { value: 'all', label: '全部身高' },
    { value: 'short', label: '小个子' },
    { value: 'average', label: '中等' },
    { value: 'tall', label: '高个子' }
  ];

  const styleOptions: { value: StyleFilter; label: string }[] = [
    { value: 'all', label: '全部风格' },
    { value: 'power', label: '力量' },
    { value: 'technique', label: '技术' },
    { value: 'endurance', label: '耐力' },
    { value: 'dynamic', label: '动态' }
  ];

  const getBodyTypeLabel = (bt: string) => {
    const map: Record<string, string> = { short: '小个子', average: '中等', tall: '高个子' };
    return map[bt] || bt;
  };

  const getStyleLabel = (s: string) => {
    const map: Record<string, string> = { power: '力量', technique: '技术', endurance: '耐力', dynamic: '动态' };
    return map[s] || s;
  };

  const getDifficultyStyle = (d: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      beginner: { color: '#52C41A', bg: 'rgba(82, 196, 26, 0.2)' },
      intermediate: { color: '#1890FF', bg: 'rgba(24, 144, 255, 0.2)' },
      advanced: { color: '#FAAD14', bg: 'rgba(250, 173, 20, 0.2)' },
      expert: { color: '#F5222D', bg: 'rgba(245, 34, 45, 0.2)' }
    };
    return map[d] || { color: '#86909C', bg: 'rgba(134, 144, 156, 0.2)' };
  };

  const difficultyLabel: Record<string, string> = {
    beginner: '入门级', intermediate: '中级', advanced: '高级', expert: '专家级'
  };

  const handleOpenNewBeta = () => {
    setSelectedRoute(null);
    setBetaTitle('');
    setBetaTags('');
    setBetaDifficulty('intermediate');
    setBetaBodyType(['average']);
    setBetaStyle(['technique']);
    setBetaSteps([]);
    setBetaOverallTips('');
    setShowNewBeta(true);
  };

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    setShowRouteSelect(false);
  };

  const toggleBodyType = (type: 'short' | 'average' | 'tall') => {
    if (betaBodyType.includes(type)) {
      setBetaBodyType(betaBodyType.filter(t => t !== type));
    } else {
      setBetaBodyType([...betaBodyType, type]);
    }
  };

  const toggleStyle = (style: 'power' | 'technique' | 'endurance' | 'dynamic') => {
    if (betaStyle.includes(style)) {
      setBetaStyle(betaStyle.filter(s => s !== style));
    } else {
      setBetaStyle([...betaStyle, style]);
    }
  };

  const handleAddStep = () => {
    setEditingStep({
      index: betaSteps.length + 1,
      description: '',
      leftHand: '',
      rightHand: '',
      leftFoot: '',
      rightFoot: '',
      keyTip: '',
      commonMistake: ''
    });
    setShowStepForm(true);
  };

  const handleEditStep = (step: BetaStep) => {
    setEditingStep({ ...step });
    setShowStepForm(true);
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = betaSteps.filter(s => s.index !== index).map((s, i) => ({ ...s, index: i + 1 }));
    setBetaSteps(newSteps);
  };

  const handleSaveStep = () => {
    if (!editingStep || !editingStep.description?.trim()) {
      Taro.showToast({ title: '请填写动作描述', icon: 'none' });
      return;
    }

    const step: BetaStep = {
      index: editingStep.index || betaSteps.length + 1,
      description: editingStep.description,
      leftHand: editingStep.leftHand || undefined,
      rightHand: editingStep.rightHand || undefined,
      leftFoot: editingStep.leftFoot || undefined,
      rightFoot: editingStep.rightFoot || undefined,
      keyTip: editingStep.keyTip || undefined,
      commonMistake: editingStep.commonMistake || undefined
    };

    if (editingStep.index && betaSteps.some(s => s.index === editingStep.index)) {
      const newSteps = betaSteps.map(s => s.index === editingStep.index ? step : s);
      setBetaSteps(newSteps);
    } else {
      setBetaSteps([...betaSteps, step]);
    }

    setShowStepForm(false);
    setEditingStep(null);
  };

  const handleSaveBeta = () => {
    if (!selectedRoute) {
      Taro.showToast({ title: '请选择线路', icon: 'none' });
      return;
    }
    if (!betaTitle.trim()) {
      Taro.showToast({ title: '请填写Beta标题', icon: 'none' });
      return;
    }
    if (betaSteps.length === 0) {
      Taro.showToast({ title: '请至少添加一个步骤', icon: 'none' });
      return;
    }
    if (betaBodyType.length === 0) {
      Taro.showToast({ title: '请选择至少一个适合身高', icon: 'none' });
      return;
    }
    if (betaStyle.length === 0) {
      Taro.showToast({ title: '请选择至少一个攀爬风格', icon: 'none' });
      return;
    }

    const tags = betaTags.split(',').map(t => t.trim()).filter(t => t);

    const beta: MovementBeta = {
      id: generateId(),
      routeId: selectedRoute.id,
      routeName: selectedRoute.name,
      routeGrade: selectedRoute.grade,
      title: betaTitle.trim(),
      author: currentUser.name || '匿名用户',
      createdAt: new Date().toLocaleDateString('zh-CN'),
      tags,
      steps: betaSteps.sort((a, b) => a.index - b.index),
      overallTips: betaOverallTips.trim(),
      likes: 0,
      difficulty: betaDifficulty,
      bodyType: betaBodyType,
      style: betaStyle
    };

    addBeta(beta);
    setShowNewBeta(false);
    Taro.showToast({ title: 'Beta保存成功', icon: 'success' });
  };

  console.log('[Library] Showing', filteredBetas.length, 'of', betaLibrary.length, 'betas');

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>动作库</Text>
        <Text className={styles.pageSubtitle}>经典线路Beta拆解，学习高手的动作技巧</Text>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索线路、标签、作者..."
          placeholderStyle="color: #86909C"
          value={searchQuery}
          onInput={e => setSearchQuery(e.detail.value)}
        />
      </View>

      <View className={styles.addBetaBtn} onClick={handleOpenNewBeta}>
        <Text className={styles.addBetaBtnText}>+ 保存经典Beta</Text>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>难度筛选</Text>
        <View className={styles.filterRow}>
          {difficultyOptions.map(opt => (
            <View
              key={opt.value}
              className={classnames(styles.filterTag, difficultyFilter === opt.value && styles.active)}
              onClick={() => setDifficultyFilter(opt.value)}
            >
              <Text className={styles.filterTagText}>{opt.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>身高适配</Text>
        <View className={styles.filterRow}>
          {bodyTypeOptions.map(opt => (
            <View
              key={opt.value}
              className={classnames(styles.filterTag, bodyTypeFilter === opt.value && styles.active)}
              onClick={() => setBodyTypeFilter(opt.value)}
            >
              <Text className={styles.filterTagText}>{opt.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>攀爬风格</Text>
        <View className={styles.filterRow}>
          {styleOptions.map(opt => (
            <View
              key={opt.value}
              className={classnames(styles.filterTag, styleFilter === opt.value && styles.active)}
              onClick={() => setStyleFilter(opt.value)}
            >
              <Text className={styles.filterTagText}>{opt.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY>
        {filteredBetas.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📚</Text>
            <Text className={styles.emptyTitle}>暂无匹配的Beta</Text>
            <Text className={styles.emptyText}>试试调整筛选条件</Text>
          </View>
        ) : (
          filteredBetas.map(beta => (
            <BetaCard key={beta.id} beta={beta} onClick={() => setSelectedBeta(beta)} />
          ))
        )}
      </ScrollView>

      {selectedBeta && (
        <View className={styles.detailModal} onClick={() => setSelectedBeta(null)}>
          <ScrollView
            className={styles.detailContent}
            onClick={e => e.stopPropagation && (e as any).stopPropagation()}
          >
            <View className={styles.detailHeader}>
              <View className={styles.detailTitleSection}>
                <Text className={styles.detailTitle}>{selectedBeta.title}</Text>
                <View className={styles.detailRoute}>
                  <Text className={styles.detailRouteName}>{selectedBeta.routeName}</Text>
                  <DifficultyBadge grade={selectedBeta.routeGrade as any} size="sm" showLabel={false} />
                </View>
              </View>
              <View className={styles.closeBtn} onClick={() => setSelectedBeta(null)}>
                <Text className={styles.closeBtnText}>×</Text>
              </View>
            </View>

            <View className={styles.detailMeta}>
              <View className={styles.detailMetaItem}>
                <Text className={styles.detailMetaLabel}>作者</Text>
                <Text className={styles.detailMetaValue}>{selectedBeta.author}</Text>
              </View>
              <View className={styles.detailMetaItem}>
                <Text className={styles.detailMetaLabel}>发布日期</Text>
                <Text className={styles.detailMetaValue}>{selectedBeta.createdAt}</Text>
              </View>
              <View className={styles.detailMetaItem}>
                <Text className={styles.detailMetaLabel}>难度级别</Text>
                <Text
                  className={styles.detailMetaValue}
                  style={{ color: getDifficultyStyle(selectedBeta.difficulty).color }}
                >
                  {difficultyLabel[selectedBeta.difficulty]}
                </Text>
              </View>
              <View className={styles.detailMetaItem}>
                <Text className={styles.detailMetaLabel}>点赞</Text>
                <Text className={styles.detailMetaValue}>👍 {selectedBeta.likes}</Text>
              </View>
            </View>

            <View className={styles.detailTags}>
              {selectedBeta.tags.map((tag, i) => (
                <View key={i} className={styles.detailTag}>
                  <Text className={styles.detailTagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            <View className={styles.bodyStyleTags}>
              <Text className={{ fontSize: 24, color: '#86909C', marginRight: 12 }}>适合：</Text>
              {selectedBeta.bodyType.map((bt, i) => (
                <View key={i} className={styles.bodyStyleTag}>
                  <Text className={styles.bodyStyleTagText}>{getBodyTypeLabel(bt)}</Text>
                </View>
              ))}
              {selectedBeta.style.map((s, i) => (
                <View key={`s-${i}`} className={styles.bodyStyleTag}>
                  <Text className={styles.bodyStyleTagText}>{getStyleLabel(s)}型</Text>
                </View>
              ))}
            </View>

            <View className={styles.overallTips}>
              <Text className={styles.overallTipsLabel}>
                💡 核心技巧总结
              </Text>
              <Text className={styles.overallTipsText}>{selectedBeta.overallTips}</Text>
            </View>

            <View className={styles.stepsSection}>
              <Text className={styles.stepsTitle}>
                📋 详细动作拆解 ({selectedBeta.steps.length}步)
              </Text>

              {selectedBeta.steps.map(step => (
                <View key={step.index} className={styles.stepCard}>
                  <View className={styles.stepHeader}>
                    <View className={styles.stepIndex}>
                      <Text className={styles.stepIndexText}>{step.index}</Text>
                    </View>
                    <Text className={styles.stepDescription}>{step.description}</Text>
                  </View>

                  {(step.leftHand || step.rightHand || step.leftFoot || step.rightFoot) && (
                    <View className={styles.stepBodyPosition}>
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
                  )}

                  {step.keyTip && (
                    <View className={styles.stepTip}>
                      <Text className={styles.stepTipLabel}>✅ 关键技巧</Text>
                      <Text className={styles.stepTipText}>{step.keyTip}</Text>
                    </View>
                  )}

                  {step.commonMistake && (
                    <View className={styles.stepMistake}>
                      <Text className={styles.stepMistakeLabel}>❌ 常见错误</Text>
                      <Text className={styles.stepMistakeText}>{step.commonMistake}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {showNewBeta && (
        <View className={styles.modalOverlay} onClick={() => setShowNewBeta(false)}>
          <ScrollView
            className={styles.modalContent}
            onClick={e => e.stopPropagation && (e as any).stopPropagation()}
          >
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>保存经典Beta</Text>
              <View className={styles.closeBtn} onClick={() => setShowNewBeta(false)}>
                <Text className={styles.closeBtnText}>关闭</Text>
              </View>
            </View>

            <View className={styles.formSection}>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>选择线路 *</Text>
                <View className={styles.routeSelector} onClick={() => setShowRouteSelect(true)}>
                  {selectedRoute ? (
                    <>
                      <Text className={styles.routeSelectorName}>{selectedRoute.name}</Text>
                      <Text className={styles.routeSelectorGrade}>[{selectedRoute.grade}]</Text>
                    </>
                  ) : (
                    <Text className={styles.routeSelectorPlaceholder}>点击选择线路</Text>
                  )}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>Beta标题 *</Text>
                <Input
                  className={styles.input}
                  placeholder="例如：小个子友好版动态起步"
                  value={betaTitle}
                  onInput={e => setBetaTitle(e.detail.value)}
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>标签（用逗号分隔）</Text>
                <Input
                  className={styles.input}
                  placeholder="例如：动态, 小个子, 起步技巧"
                  value={betaTags}
                  onInput={e => setBetaTags(e.detail.value)}
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>难度级别</Text>
                <View className={styles.tagGrid}>
                  {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map(diff => (
                    <View
                      key={diff}
                      className={`${styles.tagItem} ${betaDifficulty === diff ? styles.tagItemActive : ''}`}
                      onClick={() => setBetaDifficulty(diff)}
                    >
                      <Text className={styles.tagItemText}>{difficultyLabel[diff]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>适合身高（可多选）</Text>
                <View className={styles.tagGrid}>
                  {(['short', 'average', 'tall'] as const).map(type => (
                    <View
                      key={type}
                      className={`${styles.tagItem} ${betaBodyType.includes(type) ? styles.tagItemActive : ''}`}
                      onClick={() => toggleBodyType(type)}
                    >
                      <Text className={styles.tagItemText}>{getBodyTypeLabel(type)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>攀爬风格（可多选）</Text>
                <View className={styles.tagGrid}>
                  {(['power', 'technique', 'endurance', 'dynamic'] as const).map(style => (
                    <View
                      key={style}
                      className={`${styles.tagItem} ${betaStyle.includes(style) ? styles.tagItemActive : ''}`}
                      onClick={() => toggleStyle(style)}
                    >
                      <Text className={styles.tagItemText}>{getStyleLabel(style)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.stepsListHeader}>
                <Text className={styles.stepsListTitle}>动作步骤 ({betaSteps.length})</Text>
                <View className={styles.addStepBtn} onClick={handleAddStep}>
                  <Text className={styles.addStepBtnText}>+ 添加步骤</Text>
                </View>
              </View>

              {betaSteps.length === 0 ? (
                <View className={styles.emptySteps}>
                  <Text className={styles.emptyStepsText}>暂无步骤，点击上方按钮添加</Text>
                </View>
              ) : (
                <View className={styles.stepsList}>
                  {betaSteps.map(step => (
                    <View key={step.index} className={styles.stepListItem}>
                      <View className={styles.stepIndexBadge}>
                        <Text className={styles.stepIndexText}>{step.index}</Text>
                      </View>
                      <View className={styles.stepListItemContent}>
                        <Text className={styles.stepListItemDesc}>{step.description}</Text>
                        {(step.keyTip && (
                          <Text className={styles.stepListItemTip}>💡 {step.keyTip}</Text>
                        ))}
                      </View>
                      <View className={styles.stepListItemActions}>
                        <View className={styles.stepEditBtn} onClick={() => handleEditStep(step)}>
                          <Text className={styles.stepEditBtnText}>编辑</Text>
                        </View>
                        <View className={styles.stepDeleteBtn} onClick={() => handleDeleteStep(step.index)}>
                          <Text className={styles.stepDeleteBtnText}>删除</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>核心技巧总结</Text>
                <Textarea
                  className={styles.textarea}
                  placeholder="例如：起步时重心要低，注意脚点顺序很重要..."
                  value={betaOverallTips}
                  onInput={e => setBetaOverallTips(e.detail.value)}
                />
              </View>
            </View>

            <View className={styles.modalFooter}>
              <View className={`${styles.actionBtn} ${styles.secondary}`} onClick={() => setShowNewBeta(false)}>
                <Text className={styles.actionBtnText}>取消</Text>
              </View>
              <View className={`${styles.actionBtn} ${styles.primary}`} onClick={handleSaveBeta}>
                <Text className={styles.actionBtnText}>保存Beta</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {showRouteSelect && (
        <View className={styles.modalOverlay} onClick={() => setShowRouteSelect(false)}>
          <ScrollView
            className={styles.modalContent}
            onClick={e => e.stopPropagation && (e as any).stopPropagation()}
          >
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择线路</Text>
              <View className={styles.closeBtn} onClick={() => setShowRouteSelect(false)}>
                <Text className={styles.closeBtnText}>关闭</Text>
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

      {showStepForm && editingStep && (
        <View className={styles.modalOverlay} onClick={() => setShowStepForm(false)}>
          <ScrollView
            className={styles.modalContent}
            onClick={e => e.stopPropagation && (e as any).stopPropagation()}
          >
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>
                {editingStep.index && betaSteps.some(s => s.index === editingStep.index) ? '编辑步骤' : `第${editingStep.index}步`}
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
                <Text className={styles.formLabel}>关键技巧</Text>
                <Textarea
                  className={styles.textarea}
                  placeholder="例如：注意转肩，重心移向左脚"
                  value={editingStep.keyTip || ''}
                  onInput={e => setEditingStep({ ...editingStep, keyTip: e.detail.value })}
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>常见错误</Text>
                <Textarea
                  className={styles.textarea}
                  placeholder="例如：容易重心太靠后，失去平衡"
                  value={editingStep.commonMistake || ''}
                  onInput={e => setEditingStep({ ...editingStep, commonMistake: e.detail.value })}
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

export default LibraryPage;

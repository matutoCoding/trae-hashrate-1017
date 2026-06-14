import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import classnames from 'classnames';
import { useBoulderingStore } from '@/store/useBoulderingStore';
import { MovementBeta } from '@/types/training';
import BetaCard from '@/components/BetaCard';
import DifficultyBadge from '@/components/DifficultyBadge';
import styles from './index.module.scss';

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
type BodyTypeFilter = 'all' | 'short' | 'average' | 'tall';
type StyleFilter = 'all' | 'power' | 'technique' | 'endurance' | 'dynamic';

const LibraryPage: React.FC = () => {
  const { betaLibrary } = useBoulderingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [bodyTypeFilter, setBodyTypeFilter] = useState<BodyTypeFilter>('all');
  const [styleFilter, setStyleFilter] = useState<StyleFilter>('all');
  const [selectedBeta, setSelectedBeta] = useState<MovementBeta | null>(null);

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
    </View>
  );
};

export default LibraryPage;

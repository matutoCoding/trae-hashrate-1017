import { TrainingLogEntry, MovementBeta } from '@/types/training';

export const mockLogs: TrainingLogEntry[] = [
  {
    id: 'log-1',
    routeId: 'route-1',
    routeName: '橙色三角力量',
    routeGrade: 'V3',
    date: '2025-12-10',
    attempts: 3,
    status: 'send',
    completionPercent: 100,
    notes: '第三次尝试完成，第4步死点一开始没找好节奏',
    failPoint: '第4步死点动作',
    failCategory: 'technique',
    warmupQuality: 7,
    energyLevel: 7,
    durationMinutes: 20
  },
  {
    id: 'log-2',
    routeId: 'route-2',
    routeName: '蓝色动态弧线',
    routeGrade: 'V5',
    date: '2025-12-09',
    attempts: 5,
    status: 'project',
    completionPercent: 75,
    failPoint: '第5步抓握M3点',
    failCategory: 'finger',
    notes: '手指力量不够，抓不住小扣点',
    warmupQuality: 6,
    energyLevel: 6,
    durationMinutes: 35
  },
  {
    id: 'log-3',
    routeId: 'route-3',
    routeName: '绿色技术迷宫',
    routeGrade: 'V2',
    date: '2025-12-08',
    attempts: 1,
    status: 'flash',
    completionPercent: 100,
    notes: '一次完成，脚法运用得不错',
    warmupQuality: 8,
    energyLevel: 8,
    durationMinutes: 5
  },
  {
    id: 'log-4',
    routeId: 'route-5',
    routeName: '紫色入门直线',
    routeGrade: 'V0',
    date: '2025-12-07',
    attempts: 1,
    status: 'flash',
    completionPercent: 100,
    notes: '热身线路，轻松完成',
    warmupQuality: 5,
    energyLevel: 9,
    durationMinutes: 3
  },
  {
    id: 'log-5',
    routeId: 'route-4',
    routeName: '红色力量斜坡',
    routeGrade: 'V6',
    date: '2025-12-05',
    attempts: 8,
    status: 'fail',
    completionPercent: 50,
    failPoint: '第3步持续发力',
    failCategory: 'endurance',
    notes: '大仰角耐力不够，爬到一半就没力了',
    warmupQuality: 7,
    energyLevel: 5,
    durationMinutes: 45,
    injuries: ['右前臂轻微酸痛']
  },
  {
    id: 'log-6',
    routeId: 'route-1',
    routeName: '橙色三角力量',
    routeGrade: 'V3',
    date: '2025-12-03',
    attempts: 6,
    status: 'project',
    completionPercent: 80,
    failPoint: '第3步交叉脚法',
    failCategory: 'balance',
    notes: '交叉脚时平衡没控制好',
    warmupQuality: 6,
    energyLevel: 6,
    durationMinutes: 30
  }
];

export const mockBetaLibrary: MovementBeta[] = [
  {
    id: 'beta-1',
    routeId: 'route-1',
    routeName: '橙色三角力量',
    routeGrade: 'V3',
    title: '经典死点Beta - 小个子版本',
    author: '大神阿强',
    createdAt: '2025-11-15',
    tags: ['crimp', 'deadpoint', '小个子友好'],
    difficulty: 'intermediate',
    bodyType: ['short', 'average'],
    style: ['power', 'technique'],
    likes: 28,
    overallTips: '这条线路关键在于第4步死点，脚点布置非常重要。小个子可以多利用动态发力弥补身高劣势。',
    steps: [
      {
        index: 1,
        description: '双手握起步大把手，双脚踩稳起步脚点',
        leftHand: 'S1',
        rightHand: 'S2',
        leftFoot: '左下起步脚点',
        rightFoot: '右下起步脚点',
        keyTip: '身体尽量贴近岩壁，减少手臂承重'
      },
      {
        index: 2,
        description: '重心右移，右手抓M1小扣点',
        leftHand: 'S1',
        rightHand: 'M1',
        leftFoot: '保持',
        rightFoot: '上移到M1正下方脚点',
        keyTip: '右手抓点前先把重心完全移到右脚上'
      },
      {
        index: 3,
        description: '交叉脚：右脚横跨到M2下方边缘点',
        leftHand: 'M1',
        rightHand: 'M2',
        leftFoot: '保持',
        rightFoot: 'M2下方边缘点',
        keyTip: '这个交叉脚是关键，右脚一定要踩实，身体向外旋转一点'
      },
      {
        index: 4,
        description: '死点：左脚发力蹬起，左手抓M3',
        leftHand: 'M3',
        rightHand: 'M2',
        leftFoot: 'M3左下方脚点',
        rightFoot: '保持',
        keyTip: '发力前深呼吸，利用腿部爆发而不是手拉',
        commonMistake: '不要只用手拉，很容易脱手且伤肩'
      },
      {
        index: 5,
        description: '右手到结束点完成',
        leftHand: 'M3',
        rightHand: 'F1',
        leftFoot: '保持',
        rightFoot: '上移到高处脚点',
        keyTip: '最后一步比较轻松，控制好节奏即可'
      }
    ]
  },
  {
    id: 'beta-2',
    routeId: 'route-2',
    routeName: '蓝色动态弧线',
    routeGrade: 'V5',
    title: '动态跳跃技巧详解',
    author: '大神阿强',
    createdAt: '2025-11-20',
    tags: ['dyno', 'sloper', '大仰角'],
    difficulty: 'advanced',
    bodyType: ['average', 'tall'],
    style: ['dynamic', 'power'],
    likes: 45,
    overallTips: '大仰角动态线路，核心力量和爆发力是关键。sloper点的抓握技巧很重要。',
    steps: [
      {
        index: 1,
        description: '起步双手握稳，双脚踩好',
        leftHand: 'S1',
        rightHand: 'S2',
        leftFoot: '左起步脚',
        rightFoot: '右起步脚',
        keyTip: '身体自然下垂，不要耸肩'
      },
      {
        index: 2,
        description: '双手换握sloper点',
        leftHand: 'M1',
        rightHand: 'M1',
        leftFoot: '保持',
        rightFoot: '保持',
        keyTip: 'sloper要张开手掌，用摩擦力而不是扣握',
        commonMistake: '抓sloper时手指太用力扣，反而抓不住'
      },
      {
        index: 3,
        description: '准备动态：屈膝蓄力',
        leftHand: 'M1',
        rightHand: 'M1',
        leftFoot: '准备蹬',
        rightFoot: '准备蹬',
        keyTip: '臀部向后坐，像弹簧一样蓄力'
      },
      {
        index: 4,
        description: 'Dyno：双腿爆发蹬出，右手抓pinch点',
        leftHand: 'M1',
        rightHand: 'M2',
        leftFoot: '腾空',
        rightFoot: '腾空',
        keyTip: '眼睛盯着目标点，发力要干脆',
        commonMistake: '犹豫发力，腾空高度不够就会脱手'
      }
    ]
  },
  {
    id: 'beta-3',
    routeId: 'route-3',
    routeName: '绿色技术迷宫',
    routeGrade: 'V2',
    title: '新手友好 - 平衡技巧入门',
    author: '柔术小美',
    createdAt: '2025-11-25',
    tags: ['balance', 'technique', '新手友好'],
    difficulty: 'beginner',
    bodyType: ['short', 'average', 'tall'],
    style: ['technique', 'endurance'],
    likes: 67,
    overallTips: '技术入门线路，不需要很大力量，重点是脚法和身体平衡。',
    steps: [
      {
        index: 1,
        description: '起步姿势',
        leftHand: 'S1',
        rightHand: '起步岩壁',
        leftFoot: '起步脚',
        rightFoot: '脚点F1',
        keyTip: '右脚踩脚点时注意角度，用鞋底边缘摩擦'
      },
      {
        index: 2,
        description: '侧拉动作',
        leftHand: 'M1',
        rightHand: '保持',
        leftFoot: '保持',
        rightFoot: '保持',
        keyTip: '身体向左侧倾，利用体重辅助侧拉'
      }
    ]
  }
];

import type { EndingDefinition, QuestNode } from './types'

export const questNodes: QuestNode[] = [
  {
    id: 'main-recover-stamp-printer',
    title: '取回不该说话的盖章机',
    kind: 'main',
    trigger: '获得避难所临时通行证后',
    outcomes: ['解锁市政引擎线索', '队列管理局声望变化', '地下市场入口开放'],
  },
  {
    id: 'side-last-hotpot',
    title: '最后一桌火锅预约',
    kind: 'side',
    trigger: '黄昏后进入旧食街',
    outcomes: ['调停敌对阵营', '获得燃料', '改变社区士气'],
  },
]

export const endings: EndingDefinition[] = [
  {
    id: 'city-restored',
    title: '城市重启',
    requirement: '修复市政引擎并接受局部牺牲',
  },
  {
    id: 'small-survival',
    title: '小小幸存',
    requirement: '放弃宏大决策，保护一个具体社区',
  },
]

export interface WorldClock {
  day: number
  hour: number
  minute: number
}

export interface ResourceState {
  food: number
  water: number
  medicine: number
  morale: number
}

export type RegistryNameStatus = '未核验' | '已填报' | '被档案读取'

export interface ProtagonistState {
  displayName: string
  registryNameStatus: RegistryNameStatus
  permitStatus: string
  registryNumber: string
}

export type DistrictStatus =
  | '照常通行'
  | '错峰限行'
  | '积水待排'
  | '临时停电'
  | '贴封管控'
  | '转移安置'
  | '停供断线'
  | '社区庇护'
  | '下沉失序'

export interface DistrictState {
  id: string
  name: string
  status: DistrictStatus
  notes: string[]
}

export interface AnomalyExposureState {
  global: number
  floor: number
  districts: Record<string, number>
}

export type FactionRelation = '敌对' | '警惕' | '交易' | '信任' | '绑定'

export interface FactionState {
  id: string
  name: string
  relation: FactionRelation
  notes: string[]
}

export type CompanionCondition = '稳定' | '疲惫' | '负伤' | '创伤' | '离队' | '失踪' | '死亡'

export interface CompanionState {
  id: string
  name: string
  condition: CompanionCondition
  trust: number
  notes: string[]
}

export type EndingLockStatus = '未评估' | '入口开启' | '入口锁死' | '被改写'

export interface EndingLockState {
  id: string
  title: string
  status: EndingLockStatus
  notes: string[]
}

export interface QuestState {
  active: string[]
  completed: string[]
  failed: string[]
}

export type WorldFlagValue = boolean | number | string

export interface WorldState {
  clock: WorldClock
  protagonist: ProtagonistState
  resources: ResourceState
  districts: Record<string, DistrictState>
  anomalyExposure: AnomalyExposureState
  factions: Record<string, FactionState>
  companions: Record<string, CompanionState>
  irreversibleFlags: Record<string, WorldFlagValue>
  endingLocks: Record<string, EndingLockState>
  quests: QuestState
  flags: Record<string, WorldFlagValue>
}

export const initialWorldState: WorldState = {
  clock: { day: 1, hour: 7, minute: 30 },
  protagonist: {
    displayName: '未核验姓名',
    registryNameStatus: '未核验',
    permitStatus: '临时通行条待核验',
    registryNumber: 'LC-REG-PENDING',
  },
  resources: { food: 4, water: 5, medicine: 1, morale: 48 },
  districts: {
    temporary_shelter: {
      id: 'temporary_shelter',
      name: '临时避难点',
      status: '照常通行',
      notes: ['登记台仍在发放临时通行条。'],
    },
    community_service_center: {
      id: 'community_service_center',
      name: '社区服务中心',
      status: '照常通行',
      notes: ['窗口灯牌保持通电，叫号屏偶尔跳号。'],
    },
    flooded_archive: {
      id: 'flooded_archive',
      name: '积水档案室',
      status: '积水待排',
      notes: ['地下档案室水线压过第一排柜脚。'],
    },
    downstream_block: {
      id: 'downstream_block',
      name: '下游承压片区',
      status: '错峰限行',
      notes: ['排水回执暂未确认。'],
    },
  },
  anomalyExposure: {
    global: 12,
    floor: 0,
    districts: {
      temporary_shelter: 8,
      community_service_center: 14,
      flooded_archive: 18,
    },
  },
  factions: {
    queue_authority: {
      id: 'queue_authority',
      name: '排队管理处',
      relation: '警惕',
      notes: ['临时通行条尚未转为正式资格。'],
    },
    municipal_echo: {
      id: 'municipal_echo',
      name: '市政回声',
      relation: '警惕',
      notes: ['自动派单系统仍在等待接入。'],
    },
    underground_banquet: {
      id: 'underground_banquet',
      name: '地下饭局',
      relation: '警惕',
      notes: ['地下路线尚未建立人情债。'],
    },
    glass_tower_company: {
      id: 'glass_tower_company',
      name: '玻璃楼公司',
      relation: '警惕',
      notes: ['库存模型暂未读取第一章选择。'],
    },
  },
  companions: {
    lin_xiaoman: {
      id: 'lin_xiaoman',
      name: '林小满',
      condition: '稳定',
      trust: 52,
      notes: ['她把熟客名单和收据纸分开放在腰包里。'],
    },
  },
  irreversibleFlags: {},
  endingLocks: {
    city_restart: { id: 'city_restart', title: '城市重启', status: '未评估', notes: [] },
    city_unbound: { id: 'city_unbound', title: '城市松绑', status: '未评估', notes: [] },
    negotiation: { id: 'negotiation', title: '谈判', status: '未评估', notes: [] },
    queue_moves_on: { id: 'queue_moves_on', title: '队伍继续前进', status: '未评估', notes: [] },
    small_survival: { id: 'small_survival', title: '小小幸存', status: '未评估', notes: [] },
  },
  quests: {
    active: ['chapter-1'],
    completed: [],
    failed: [],
  },
  flags: {
    chapter: '补办窗口不会等人',
    currentZone: '临时避难点',
  },
}

export function clampExposure(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

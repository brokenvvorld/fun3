import type {
  CompanionCondition,
  DistrictStatus,
  FactionRelation,
  RegistryNameStatus,
  WorldState,
} from '../../game/simulation/state'

export type AppScreen = 'mainMenu' | 'identity' | 'playing' | 'archive' | 'codex' | 'settings'

export interface ProcedureLogEntry {
  id: string
  title: string
  summary: string
}

export interface SaveGameData {
  version: 2
  screen: AppScreen
  storyStateJson?: string
  investigationFeedback?: Record<string, string[]>
  world: WorldState
  procedureLog: ProcedureLogEntry[]
  debugVisible: boolean
  musicEnabled: boolean
  soundEnabled: boolean
  captionsEnabled: boolean
}

const SAVE_KEY = 'fun3.chapter1.save.v2'
const LEGACY_SAVE_KEYS = ['fun3.chapter1.save.v1']
const APP_SCREENS: AppScreen[] = ['mainMenu', 'identity', 'playing', 'archive', 'codex', 'settings']
const REGISTRY_NAME_STATUSES: RegistryNameStatus[] = ['未核验', '已填报', '被档案读取']
const DISTRICT_STATUSES: DistrictStatus[] = [
  '照常通行',
  '错峰限行',
  '积水待排',
  '临时停电',
  '贴封管控',
  '转移安置',
  '停供断线',
  '社区庇护',
  '下沉失序',
]
const FACTION_RELATIONS: FactionRelation[] = ['敌对', '警惕', '交易', '信任', '绑定']
const COMPANION_CONDITIONS: CompanionCondition[] = ['稳定', '疲惫', '负伤', '创伤', '离队', '失踪', '死亡']

export function loadSaveGame(): SaveGameData | null {
  if (typeof window === 'undefined') return null

  LEGACY_SAVE_KEYS.forEach((key) => window.localStorage.removeItem(key))
  const rawSave = window.localStorage.getItem(SAVE_KEY)
  if (!rawSave) return null

  try {
    const save = JSON.parse(rawSave) as SaveGameData
    if (
      save.version !== 2 ||
      !isAppScreen(save.screen) ||
      !isWorldStateLike(save.world) ||
      !isSaveBooleansValid(save) ||
      !isProcedureLog(save.procedureLog) ||
      !isInvestigationFeedback(save.investigationFeedback) ||
      !isOptionalString(save.storyStateJson)
    ) {
      window.localStorage.removeItem(SAVE_KEY)
      return null
    }
    return save
  } catch {
    window.localStorage.removeItem(SAVE_KEY)
    return null
  }
}

export function saveGame(data: SaveGameData): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

export function clearSaveGame(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SAVE_KEY)
  LEGACY_SAVE_KEYS.forEach((key) => window.localStorage.removeItem(key))
}

export function hasSaveGame(): boolean {
  if (typeof window === 'undefined') return false
  return loadSaveGame() !== null
}

function isAppScreen(value: unknown): value is AppScreen {
  return typeof value === 'string' && APP_SCREENS.includes(value as AppScreen)
}

function isWorldStateLike(value: unknown): value is WorldState {
  if (!value || typeof value !== 'object') return false
  const world = value as Partial<WorldState>
  return (
    isProtagonistStateLike(world.protagonist) &&
    isResourceStateLike(world.resources) &&
    isDistrictRecord(world.districts) &&
    isAnomalyExposureLike(world.anomalyExposure) &&
    isFactionRecord(world.factions) &&
    isCompanionRecord(world.companions) &&
    isWorldFlagRecord(world.irreversibleFlags) &&
    isEndingLockRecord(world.endingLocks) &&
    isQuestStateLike(world.quests) &&
    isWorldFlagRecord(world.flags)
  )
}

function isProtagonistStateLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const protagonist = value as Partial<WorldState['protagonist']>
  return (
    typeof protagonist.displayName === 'string' &&
    isRegistryNameStatus(protagonist.registryNameStatus) &&
    typeof protagonist.permitStatus === 'string' &&
    typeof protagonist.registryNumber === 'string'
  )
}

function isRegistryNameStatus(value: unknown): value is RegistryNameStatus {
  return typeof value === 'string' && REGISTRY_NAME_STATUSES.includes(value as RegistryNameStatus)
}

function isResourceStateLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const resources = value as Partial<WorldState['resources']>
  return (
    typeof resources.food === 'number' &&
    typeof resources.water === 'number' &&
    typeof resources.medicine === 'number' &&
    typeof resources.morale === 'number'
  )
}

function isAnomalyExposureLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const exposure = value as Partial<WorldState['anomalyExposure']>
  return (
    typeof exposure.global === 'number' &&
    typeof exposure.floor === 'number' &&
    isNumberRecord(exposure.districts)
  )
}

function isDistrictRecord(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every(isDistrictStateLike)
}

function isDistrictStateLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const district = value as Partial<WorldState['districts'][string]>
  return (
    typeof district.id === 'string' &&
    typeof district.name === 'string' &&
    isDistrictStatus(district.status) &&
    isStringArray(district.notes)
  )
}

function isDistrictStatus(value: unknown): value is DistrictStatus {
  return typeof value === 'string' && DISTRICT_STATUSES.includes(value as DistrictStatus)
}

function isFactionRecord(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every(isFactionStateLike)
}

function isFactionStateLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const faction = value as Partial<WorldState['factions'][string]>
  return (
    typeof faction.id === 'string' &&
    typeof faction.name === 'string' &&
    isFactionRelation(faction.relation) &&
    isStringArray(faction.notes)
  )
}

function isFactionRelation(value: unknown): value is FactionRelation {
  return typeof value === 'string' && FACTION_RELATIONS.includes(value as FactionRelation)
}

function isCompanionRecord(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every(isCompanionStateLike)
}

function isCompanionStateLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const companion = value as Partial<WorldState['companions'][string]>
  return (
    typeof companion.id === 'string' &&
    typeof companion.name === 'string' &&
    isCompanionCondition(companion.condition) &&
    typeof companion.trust === 'number' &&
    isStringArray(companion.notes)
  )
}

function isCompanionCondition(value: unknown): value is CompanionCondition {
  return typeof value === 'string' && COMPANION_CONDITIONS.includes(value as CompanionCondition)
}

function isEndingLockRecord(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every(isEndingLockStateLike)
}

function isEndingLockStateLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const endingLock = value as Partial<WorldState['endingLocks'][string]>
  return (
    typeof endingLock.id === 'string' &&
    typeof endingLock.title === 'string' &&
    typeof endingLock.status === 'string' &&
    isStringArray(endingLock.notes)
  )
}

function isQuestStateLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const quests = value as Partial<WorldState['quests']>
  return isStringArray(quests.active) && isStringArray(quests.completed) && isStringArray(quests.failed)
}

function isWorldFlagRecord(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every(isWorldFlagValue)
}

function isWorldFlagValue(value: unknown): boolean {
  return typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string'
}

function isNumberRecord(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every((recordValue) => typeof recordValue === 'number')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isSaveBooleansValid(save: Partial<SaveGameData>): boolean {
  return (
    typeof save.debugVisible === 'boolean' &&
    typeof save.musicEnabled === 'boolean' &&
    typeof save.soundEnabled === 'boolean' &&
    typeof save.captionsEnabled === 'boolean'
  )
}

function isProcedureLog(value: unknown): value is ProcedureLogEntry[] {
  return Array.isArray(value) && value.every(isProcedureLogEntry)
}

function isProcedureLogEntry(value: unknown): value is ProcedureLogEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<ProcedureLogEntry>
  return typeof entry.id === 'string' && typeof entry.title === 'string' && typeof entry.summary === 'string'
}

function isInvestigationFeedback(value: unknown): value is Record<string, string[]> | undefined {
  if (value === undefined) return true
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value).every((feedback) => Array.isArray(feedback) && feedback.every(isString))
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string'
}

import type {
  CompanionCondition,
  DistrictStatus,
  EndingLockStatus,
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
  version: 3
  screen: AppScreen
  storyStateJson?: string
  readingFrame?: SavedReadingFrame
  investigationFeedback?: Record<string, string[]>
  world: WorldState
  choiceMemory: string[]
  procedureLog: ProcedureLogEntry[]
  debugVisible: boolean
  musicEnabled: boolean
  soundEnabled: boolean
  captionsEnabled: boolean
  textSpeed: 'slow' | 'standard' | 'fast'
}

export interface SavedReadingFrame {
  title: string
  location: string
  text: string[]
  canContinue: boolean
  notices: string[]
  receipts: string[]
  tags: string[]
  isComplete: boolean
}

interface SaveGameDataV2 {
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

export const SAVE_KEY = 'fun3.chapter1.save.v3'
export const V2_SAVE_KEY = 'fun3.chapter1.save.v2'
const LEGACY_SAVE_KEYS = ['fun3.chapter1.save.v1']
const APP_SCREENS: AppScreen[] = ['mainMenu', 'identity', 'playing', 'archive', 'codex', 'settings']
const TEXT_SPEEDS: SaveGameData['textSpeed'][] = ['slow', 'standard', 'fast']
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
const ENDING_LOCK_STATUSES: EndingLockStatus[] = ['未评估', '入口开启', '入口锁死', '被改写']

export function loadSaveGame(): SaveGameData | null {
  if (typeof window === 'undefined') return null

  LEGACY_SAVE_KEYS.forEach((key) => window.localStorage.removeItem(key))
  const currentSave = loadCurrentSave()
  if (currentSave) return currentSave

  const migratedSave = loadMigratedV2Save()
  if (migratedSave) return migratedSave

  return null
}

function loadCurrentSave(): SaveGameData | null {
  const rawSave = window.localStorage.getItem(SAVE_KEY)
  if (!rawSave) return null

  try {
    const save = JSON.parse(rawSave) as SaveGameData
    if (!isSaveGameDataV3(save)) {
      window.localStorage.removeItem(SAVE_KEY)
      return null
    }
    return save
  } catch {
    window.localStorage.removeItem(SAVE_KEY)
    return null
  }
}

function loadMigratedV2Save(): SaveGameData | null {
  const rawSave = window.localStorage.getItem(V2_SAVE_KEY)
  if (!rawSave) return null

  try {
    const save = JSON.parse(rawSave) as SaveGameDataV2
    if (!isSaveGameDataV2(save)) {
      window.localStorage.removeItem(V2_SAVE_KEY)
      return null
    }
    return {
      version: 3,
      screen: save.screen,
      storyStateJson: save.storyStateJson,
      readingFrame: undefined,
      investigationFeedback: save.investigationFeedback ?? {},
      world: save.world,
      choiceMemory: [],
      procedureLog: save.procedureLog,
      debugVisible: save.debugVisible,
      musicEnabled: save.musicEnabled,
      soundEnabled: save.soundEnabled,
      captionsEnabled: save.captionsEnabled,
      textSpeed: 'standard',
    }
  } catch {
    window.localStorage.removeItem(V2_SAVE_KEY)
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
  window.localStorage.removeItem(V2_SAVE_KEY)
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
    isNonEmptyNumberRecord(exposure.districts)
  )
}

function isDistrictRecord(value: unknown): boolean {
  return isNonEmptyRecord(value) && Object.values(value).every(isDistrictStateLike)
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
  return isNonEmptyRecord(value) && Object.values(value).every(isFactionStateLike)
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
  return isNonEmptyRecord(value) && Object.values(value).every(isCompanionStateLike)
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
  return isNonEmptyRecord(value) && Object.values(value).every(isEndingLockStateLike)
}

function isEndingLockStateLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const endingLock = value as Partial<WorldState['endingLocks'][string]>
  return (
    typeof endingLock.id === 'string' &&
    typeof endingLock.title === 'string' &&
    isEndingLockStatus(endingLock.status) &&
    isStringArray(endingLock.notes)
  )
}

function isEndingLockStatus(value: unknown): value is EndingLockStatus {
  return typeof value === 'string' && ENDING_LOCK_STATUSES.includes(value as EndingLockStatus)
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

function isNonEmptyNumberRecord(value: unknown): boolean {
  return isNonEmptyRecord(value) && Object.values(value).every((recordValue) => typeof recordValue === 'number')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyRecord(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && Object.keys(value).length > 0
}

function isSaveBooleansValid(save: Partial<SaveGameData>): boolean {
  return (
    typeof save.debugVisible === 'boolean' &&
    typeof save.musicEnabled === 'boolean' &&
    typeof save.soundEnabled === 'boolean' &&
    typeof save.captionsEnabled === 'boolean'
  )
}

function isSaveGameDataV3(save: Partial<SaveGameData>): save is SaveGameData {
  return (
    save.version === 3 &&
    isAppScreen(save.screen) &&
    isWorldStateLike(save.world) &&
    isSaveBooleansValid(save) &&
    isProcedureLog(save.procedureLog) &&
    isInvestigationFeedback(save.investigationFeedback) &&
    isOptionalJsonString(save.storyStateJson) &&
    isSavedReadingFrame(save.readingFrame) &&
    isStringArray(save.choiceMemory) &&
    isTextSpeed(save.textSpeed)
  )
}

function isSaveGameDataV2(save: Partial<SaveGameDataV2>): save is SaveGameDataV2 {
  return (
    save.version === 2 &&
    isAppScreen(save.screen) &&
    isWorldStateLike(save.world) &&
    areV2SaveBooleansValid(save) &&
    isProcedureLog(save.procedureLog) &&
    isInvestigationFeedback(save.investigationFeedback) &&
    isOptionalJsonString(save.storyStateJson)
  )
}

function areV2SaveBooleansValid(save: Partial<SaveGameDataV2>): boolean {
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

function isSavedReadingFrame(value: unknown): value is SavedReadingFrame | undefined {
  if (value === undefined) return true
  if (!value || typeof value !== 'object') return false
  const frame = value as Partial<SavedReadingFrame>
  return (
    typeof frame.title === 'string' &&
    typeof frame.location === 'string' &&
    isStringArray(frame.text) &&
    typeof frame.canContinue === 'boolean' &&
    isStringArray(frame.notices) &&
    isStringArray(frame.receipts) &&
    isStringArray(frame.tags) &&
    typeof frame.isComplete === 'boolean'
  )
}

function isTextSpeed(value: unknown): value is SaveGameData['textSpeed'] {
  return typeof value === 'string' && TEXT_SPEEDS.includes(value as SaveGameData['textSpeed'])
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function isOptionalJsonString(value: unknown): value is string | undefined {
  if (value === undefined) return true
  if (typeof value !== 'string') return false
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

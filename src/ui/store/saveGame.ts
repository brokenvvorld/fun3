import type { WorldState } from '../../game/simulation/state'

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
      !isProcedureLog(save.procedureLog)
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
  return window.localStorage.getItem(SAVE_KEY) !== null
}

function isAppScreen(value: unknown): value is AppScreen {
  return typeof value === 'string' && APP_SCREENS.includes(value as AppScreen)
}

function isWorldStateLike(value: unknown): value is WorldState {
  if (!value || typeof value !== 'object') return false
  const world = value as Partial<WorldState>
  return (
    typeof world.protagonist?.displayName === 'string' &&
    !!world.resources &&
    typeof world.resources === 'object' &&
    !!world.districts &&
    typeof world.districts === 'object' &&
    !!world.anomalyExposure &&
    typeof world.anomalyExposure === 'object' &&
    !!world.factions &&
    typeof world.factions === 'object' &&
    !!world.companions &&
    typeof world.companions === 'object'
  )
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

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

export function loadSaveGame(): SaveGameData | null {
  if (typeof window === 'undefined') return null

  LEGACY_SAVE_KEYS.forEach((key) => window.localStorage.removeItem(key))
  const rawSave = window.localStorage.getItem(SAVE_KEY)
  if (!rawSave) return null

  try {
    const save = JSON.parse(rawSave) as SaveGameData
    if (save.version !== 2) {
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

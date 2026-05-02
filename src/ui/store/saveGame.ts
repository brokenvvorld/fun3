import type { InkStoryView } from '../../game/narrative/inkRuntime'
import type { WorldState } from '../../game/simulation/state'

export type AppScreen = 'mainMenu' | 'identity' | 'playing' | 'archive' | 'codex' | 'settings'

export interface ProcedureLogEntry {
  id: string
  title: string
  summary: string
  timestamp?: string
}

export interface SaveGameData {
  version: 1
  screen: AppScreen
  storyStateJson?: string
  storyView?: InkStoryView
  actionFeedback?: string[]
  world: WorldState
  procedureLog: ProcedureLogEntry[]
  debugVisible: boolean
  musicEnabled: boolean
  soundEnabled: boolean
  captionsEnabled: boolean
}

const SAVE_KEY = 'fun3.chapter1.save.v1'

export function loadSaveGame(): SaveGameData | null {
  if (typeof window === 'undefined') return null

  const rawSave = window.localStorage.getItem(SAVE_KEY)
  if (!rawSave) return null

  try {
    return JSON.parse(rawSave) as SaveGameData
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
}

export function hasSaveGame(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SAVE_KEY) !== null
}

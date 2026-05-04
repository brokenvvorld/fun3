import { create } from 'zustand'
import type { Story } from 'inkjs'
import {
  chooseInkChoice,
  collectStoryView,
  DEFAULT_STORY_PATH,
  loadInkStory,
  applyProtagonistName,
  snapshotInkStory,
  type InkStoryView,
} from '../../game/narrative/inkRuntime'
import { applyChoiceEffect } from '../../game/simulation/systems/choices'
import { initialWorldState, type WorldState } from '../../game/simulation/state'
import {
  clearSaveGame,
  hasSaveGame,
  loadSaveGame,
  saveGame,
  type AppScreen,
  type ProcedureLogEntry,
} from './saveGame'

interface SettingsState {
  musicEnabled: boolean
  soundEnabled: boolean
  captionsEnabled: boolean
  textSpeed: 'slow' | 'standard' | 'fast'
}

type ToggleSettingKey = 'musicEnabled' | 'soundEnabled' | 'captionsEnabled'

interface GameStore {
  screen: AppScreen
  returnScreen?: AppScreen
  world: WorldState
  storyView: InkStoryView | null
  storyStateJson?: string
  investigationFeedback: Record<string, string[]>
  activeInvestigationTargetId?: string
  procedureLog: ProcedureLogEntry[]
  debugVisible: boolean
  pendingNewGame: boolean
  hasSave: boolean
  loading: boolean
  error?: string
  settings: SettingsState
  boot: () => void
  startNewGame: () => Promise<void>
  continueGame: () => Promise<void>
  selectAction: (actionId: string) => void
  openInvestigation: (targetId: string) => void
  closeInvestigation: () => void
  openScreen: (screen: AppScreen) => void
  returnToPreviousScreen: () => void
  backToMenu: () => void
  toggleDebugPanel: () => void
  toggleSetting: (key: ToggleSettingKey) => void
  changeTextSpeed: (direction: 'slower' | 'faster') => void
  setProtagonistName: (displayName: string) => void
}

let activeStory: Story | null = null

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'mainMenu',
  returnScreen: undefined,
  world: initialWorldState,
  storyView: null,
  investigationFeedback: {},
  activeInvestigationTargetId: undefined,
  procedureLog: [],
  debugVisible: false,
  pendingNewGame: false,
  hasSave: false,
  loading: false,
  settings: {
    musicEnabled: false,
    soundEnabled: true,
    captionsEnabled: true,
    textSpeed: 'standard',
  },
  boot: () => {
    const save = loadSaveGame()
    if (!save) {
      set({ hasSave: hasSaveGame() })
      return
    }

    set({
      hasSave: true,
      settings: {
        musicEnabled: save.musicEnabled,
        soundEnabled: save.soundEnabled,
        captionsEnabled: save.captionsEnabled,
        textSpeed: 'standard',
      },
      debugVisible: save.debugVisible,
    })
  },
  startNewGame: async () => {
    set({
      screen: 'identity',
      returnScreen: undefined,
      world: initialWorldState,
      storyView: null,
      storyStateJson: undefined,
      investigationFeedback: {},
      activeInvestigationTargetId: undefined,
      procedureLog: [],
      pendingNewGame: true,
      hasSave: hasSaveGame(),
      error: undefined,
    })
  },
  setProtagonistName: (displayName) => {
    const normalizedName = displayName.trim() || '未核验姓名'
    set({ loading: true, error: undefined })
    set((state) => ({
      world: {
        ...state.world,
        protagonist: {
          ...state.world.protagonist,
          displayName: normalizedName,
          registryNameStatus: normalizedName === '未核验姓名' ? '未核验' : '已填报',
          registryNumber: normalizedName === '未核验姓名' ? 'LC-REG-PENDING' : 'LC-REG-CH1-001',
        },
      },
    }))
    void beginChapterOne()
  },
  continueGame: async () => {
    const save = loadSaveGame()
    if (!save) {
      set({ hasSave: false, pendingNewGame: false, error: '未找到可用记录。' })
      return
    }

    set({ loading: true, pendingNewGame: false, error: undefined })
    try {
      activeStory = await loadInkStory(DEFAULT_STORY_PATH, save.world.protagonist.displayName)
      if (save.storyStateJson) {
        try {
          activeStory.state.LoadJson(save.storyStateJson)
        } catch {
          clearSaveGame()
          set({ hasSave: false, pendingNewGame: false, loading: false, error: '记录已损坏，请重新开始。' })
          return
        }
      }
      applyProtagonistName(activeStory, save.world.protagonist.displayName)
      const storyView = collectStoryView(activeStory)
      set({
        screen: save.screen === 'identity' ? 'identity' : 'playing',
        returnScreen: undefined,
        world: save.world,
        storyView,
        storyStateJson: save.storyStateJson,
        investigationFeedback: save.investigationFeedback ?? {},
        activeInvestigationTargetId: undefined,
        procedureLog: save.procedureLog ?? [],
        debugVisible: save.debugVisible,
        pendingNewGame: false,
        settings: {
          musicEnabled: save.musicEnabled,
          soundEnabled: save.soundEnabled,
          captionsEnabled: save.captionsEnabled,
          textSpeed: 'standard',
        },
        hasSave: true,
        loading: false,
      })
    } catch (error) {
      set({ pendingNewGame: false, loading: false, error: error instanceof Error ? error.message : '无法恢复记录。' })
    }
  },
  selectAction: (actionId) => {
    if (!activeStory) return

    const choiceIndex = Number(actionId)
    if (Number.isNaN(choiceIndex)) return

    const { view, effect } = chooseInkChoice(activeStory, choiceIndex)
    const selectedChoice = get().storyView?.choices.find((choice) => choice.id === actionId)
    const storyStateJson = snapshotInkStory(activeStory, view).storyStateJson
    const isInlineFeedback =
      view.tags.some((tag) => tag.trim() === 'ui:feedback') ||
      (selectedChoice?.surface === 'modal' && selectedChoice.repeatable)
    const world = isInlineFeedback ? get().world : applyChoiceEffect(get().world, effect)
    const receiptEntries = isInlineFeedback
      ? []
      : (effect.receipts ?? view.receipts).map((receipt, index) => ({
          id: `${Date.now()}-${index}`,
          title: '手续回执',
          summary: receipt,
        }))

    set((state) => ({
      world,
      storyView:
        isInlineFeedback && state.storyView
          ? {
              ...state.storyView,
              choices: view.choices,
              notices: view.notices,
              receipts: view.receipts,
              tags: view.tags,
              isComplete: view.isComplete,
            }
          : view,
      investigationFeedback:
        isInlineFeedback && selectedChoice
          ? {
              ...state.investigationFeedback,
              [selectedChoice.targetId]: [
                ...view.paragraphs.filter((paragraph) => !state.storyView?.paragraphs.includes(paragraph)),
                ...(state.investigationFeedback[selectedChoice.targetId] ?? []),
              ].slice(0, 6),
            }
          : state.investigationFeedback,
      activeInvestigationTargetId:
        isInlineFeedback && selectedChoice ? selectedChoice.targetId : undefined,
      storyStateJson,
      procedureLog: [...receiptEntries, ...state.procedureLog].slice(0, 12),
      hasSave: true,
    }))
    persist()
  },
  openScreen: (screen) => {
    const currentScreen = get().screen
    const returnScreen = currentScreen === 'playing' && isAuxiliaryScreen(screen) ? 'playing' : undefined
    set({ screen, returnScreen })
    persist()
  },
  returnToPreviousScreen: () => {
    const targetScreen = get().returnScreen === 'playing' && get().storyView ? 'playing' : 'mainMenu'
    set({ screen: targetScreen, returnScreen: undefined, error: undefined })
    persist()
  },
  openInvestigation: (targetId) => {
    set({ activeInvestigationTargetId: targetId })
  },
  closeInvestigation: () => {
    set({ activeInvestigationTargetId: undefined })
  },
  backToMenu: () => {
    set({ screen: 'mainMenu', returnScreen: undefined, error: undefined })
    if (!get().pendingNewGame) persist()
  },
  toggleDebugPanel: () => {
    set((state) => ({ debugVisible: !state.debugVisible }))
    persist()
  },
  toggleSetting: (key) => {
    set((state) => ({
      settings: {
        ...state.settings,
        [key]: !state.settings[key],
      },
    }))
    persist()
  },
  changeTextSpeed: (direction) => {
    const speeds: SettingsState['textSpeed'][] = ['slow', 'standard', 'fast']
    const currentIndex = speeds.indexOf(get().settings.textSpeed)
    const nextIndex =
      direction === 'slower' ? Math.max(0, currentIndex - 1) : Math.min(speeds.length - 1, currentIndex + 1)
    set((state) => ({
      settings: {
        ...state.settings,
        textSpeed: speeds[nextIndex],
      },
    }))
  },
}))

async function beginChapterOne(): Promise<void> {
  const setState = useGameStore.setState
  try {
    activeStory = await loadInkStory(DEFAULT_STORY_PATH, useGameStore.getState().world.protagonist.displayName)
    const storyView = collectStoryView(activeStory)
    const storyStateJson = snapshotInkStory(activeStory, storyView).storyStateJson
    setState({
      screen: 'playing',
      returnScreen: undefined,
      storyView,
      storyStateJson,
      investigationFeedback: {},
      activeInvestigationTargetId: undefined,
      pendingNewGame: false,
      hasSave: true,
      loading: false,
    })
    persist()
  } catch (error) {
    setState({ loading: false, error: error instanceof Error ? error.message : '无法载入第一章。' })
  }
}

function persist(): void {
  const state = useGameStore.getState()
  saveGame({
    version: 2,
    screen: state.screen,
    storyStateJson: state.storyStateJson,
    investigationFeedback: state.investigationFeedback,
    world: state.world,
    procedureLog: state.procedureLog,
    debugVisible: state.debugVisible,
    musicEnabled: state.settings.musicEnabled,
    soundEnabled: state.settings.soundEnabled,
    captionsEnabled: state.settings.captionsEnabled,
  })
}

function isAuxiliaryScreen(screen: AppScreen): boolean {
  return screen === 'archive' || screen === 'codex' || screen === 'settings'
}

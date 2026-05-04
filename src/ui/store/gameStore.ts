import { create } from 'zustand'
import type { Story } from 'inkjs'
import {
  chooseInkReadingChoice,
  collectReadingFrame,
  DEFAULT_STORY_PATH,
  loadInkStory,
  applyProtagonistName,
  type InkChoiceView,
  type InkReadingFrame,
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
  readingFrame: InkReadingFrame | null
  storyStateJson?: string
  investigationFeedback: Record<string, string[]>
  activeInvestigationTargetId?: string
  choiceMemory: string[]
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
  continueReading: () => void
  selectDecision: (actionId: string) => void
  selectInvestigation: (actionId: string) => void
  selectAction: (actionId: string) => void
  openInvestigation: (targetId: string) => void
  closeFeedback: () => void
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
  readingFrame: null,
  investigationFeedback: {},
  activeInvestigationTargetId: undefined,
  choiceMemory: [],
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
      screen: 'mainMenu',
      returnScreen: undefined,
      world: save.world,
      storyView: null,
      readingFrame: null,
      storyStateJson: save.storyStateJson,
      investigationFeedback: save.investigationFeedback ?? {},
      activeInvestigationTargetId: undefined,
      choiceMemory: save.choiceMemory,
      procedureLog: save.procedureLog ?? [],
      settings: {
        musicEnabled: save.musicEnabled,
        soundEnabled: save.soundEnabled,
        captionsEnabled: save.captionsEnabled,
        textSpeed: save.textSpeed,
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
      readingFrame: null,
      storyStateJson: undefined,
      investigationFeedback: {},
      activeInvestigationTargetId: undefined,
      choiceMemory: [],
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
      const readingFrame = collectReadingFrame(activeStory)
      const storyView = frameToStoryView(readingFrame)
      const storyStateJson = save.storyStateJson
      set({
        screen: save.screen === 'identity' ? 'identity' : 'playing',
        returnScreen: undefined,
        world: save.world,
        storyView,
        readingFrame,
        storyStateJson,
        investigationFeedback: save.investigationFeedback ?? {},
        activeInvestigationTargetId: undefined,
        choiceMemory: save.choiceMemory,
        procedureLog: save.procedureLog ?? [],
        debugVisible: save.debugVisible,
        pendingNewGame: false,
        settings: {
          musicEnabled: save.musicEnabled,
          soundEnabled: save.soundEnabled,
          captionsEnabled: save.captionsEnabled,
          textSpeed: save.textSpeed,
        },
        hasSave: true,
        loading: false,
      })
    } catch (error) {
      set({ pendingNewGame: false, loading: false, error: error instanceof Error ? error.message : '无法恢复记录。' })
    }
  },
  continueReading: () => {
    if (!activeStory) return

    const storyStateJson = activeStory.state.ToJson()
    const frame = collectReadingFrame(activeStory)
    const world = applyChoiceEffect(get().world, frame.effect)
    const receiptEntries = buildReceiptEntries(frame.effect.receipts ?? frame.receipts)

    set((state) => ({
      world,
      readingFrame: frame,
      storyView: frameToStoryView(frame),
      storyStateJson,
      activeInvestigationTargetId: undefined,
      procedureLog: [...receiptEntries, ...state.procedureLog].slice(0, 12),
      hasSave: true,
    }))
    persist()
  },
  selectDecision: (actionId) => {
    if (!activeStory) return

    const choiceIndex = Number(actionId)
    if (Number.isNaN(choiceIndex)) return

    const selectedChoice = findCurrentAction(get(), actionId)
    const { frame, storyStateJson, effect } = chooseInkReadingChoice(activeStory, choiceIndex)
    const world = applyChoiceEffect(get().world, effect)
    const receiptEntries = buildReceiptEntries(effect.receipts ?? frame.receipts)

    set((state) => ({
      world,
      readingFrame: frame,
      storyView: frameToStoryView(frame),
      storyStateJson,
      activeInvestigationTargetId: undefined,
      choiceMemory: selectedChoice ? [selectedChoice.label, ...state.choiceMemory].slice(0, 24) : state.choiceMemory,
      procedureLog: [...receiptEntries, ...state.procedureLog].slice(0, 12),
      hasSave: true,
    }))
    persist()
  },
  selectInvestigation: (actionId) => {
    if (!activeStory) return

    const choiceIndex = Number(actionId)
    if (Number.isNaN(choiceIndex)) return

    const selectedChoice = findCurrentAction(get(), actionId)
    const stateBeforeChoice = activeStory.state.ToJson()
    const { frame } = chooseInkReadingChoice(activeStory, choiceIndex)
    activeStory.state.LoadJson(stateBeforeChoice)
    const feedbackText = frame.text

    set((state) => ({
      storyView: state.storyView,
      storyStateJson: state.storyStateJson,
      investigationFeedback:
        selectedChoice && feedbackText.length > 0
          ? {
              ...state.investigationFeedback,
              [selectedChoice.targetId]: [
                ...feedbackText,
                ...(state.investigationFeedback[selectedChoice.targetId] ?? []),
              ].slice(0, 6),
            }
          : state.investigationFeedback,
      activeInvestigationTargetId: selectedChoice?.targetId,
      hasSave: true,
    }))
    persist()
  },
  selectAction: (actionId) => {
    const selectedChoice = findCurrentAction(get(), actionId)
    if (selectedChoice?.surface === 'modal' && selectedChoice.repeatable) {
      get().selectInvestigation(actionId)
      return
    }
    get().selectDecision(actionId)
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
  closeFeedback: () => {
    set({ activeInvestigationTargetId: undefined })
    persist()
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
    persist()
  },
}))

async function beginChapterOne(): Promise<void> {
  const setState = useGameStore.setState
  try {
    activeStory = await loadInkStory(DEFAULT_STORY_PATH, useGameStore.getState().world.protagonist.displayName)
    const storyStateJson = activeStory.state.ToJson()
    const readingFrame = collectReadingFrame(activeStory)
    const storyView = frameToStoryView(readingFrame)
    setState({
      screen: 'playing',
      returnScreen: undefined,
      storyView,
      readingFrame,
      storyStateJson,
      investigationFeedback: {},
      activeInvestigationTargetId: undefined,
      choiceMemory: [],
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
    version: 3,
    screen: state.screen,
    storyStateJson: state.storyStateJson,
    readingFrame: state.readingFrame ? serializeReadingFrame(state.readingFrame) : undefined,
    investigationFeedback: state.investigationFeedback,
    world: state.world,
    choiceMemory: state.choiceMemory,
    procedureLog: state.procedureLog,
    debugVisible: state.debugVisible,
    musicEnabled: state.settings.musicEnabled,
    soundEnabled: state.settings.soundEnabled,
    captionsEnabled: state.settings.captionsEnabled,
    textSpeed: state.settings.textSpeed,
  })
}

function isAuxiliaryScreen(screen: AppScreen): boolean {
  return screen === 'archive' || screen === 'codex' || screen === 'settings'
}

function frameToStoryView(frame: InkReadingFrame): InkStoryView {
  return {
    title: frame.title,
    location: frame.location,
    paragraphs: frame.text,
    choices: [...frame.investigations, ...frame.choices].sort((left, right) => left.index - right.index),
    notices: frame.notices,
    receipts: frame.receipts,
    tags: frame.tags,
    isComplete: frame.isComplete,
  }
}

function serializeReadingFrame(frame: InkReadingFrame) {
  return {
    title: frame.title,
    location: frame.location,
    text: frame.text,
    canContinue: frame.canContinue,
    notices: frame.notices,
    receipts: frame.receipts,
    tags: frame.tags,
    isComplete: frame.isComplete,
  }
}

function buildReceiptEntries(receipts: string[]): ProcedureLogEntry[] {
  return receipts.map((receipt, index) => ({
    id: `${Date.now()}-${index}`,
    title: '手续回执',
    summary: receipt,
  }))
}

function findCurrentAction(state: GameStore, actionId: string): InkChoiceView | undefined {
  return state.storyView?.choices.find((choice) => choice.id === actionId)
}

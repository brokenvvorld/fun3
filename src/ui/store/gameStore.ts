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
}

interface GameStore {
  screen: AppScreen
  world: WorldState
  storyView: InkStoryView | null
  storyStateJson?: string
  actionFeedback: string[]
  investigationFeedback: Record<string, string[]>
  activeInvestigationTargetId?: string
  procedureLog: ProcedureLogEntry[]
  debugVisible: boolean
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
  backToMenu: () => void
  toggleDebugPanel: () => void
  toggleSetting: (key: keyof SettingsState) => void
  setProtagonistName: (displayName: string) => void
}

let activeStory: Story | null = null

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'mainMenu',
  world: initialWorldState,
  storyView: null,
  actionFeedback: [],
  investigationFeedback: {},
  activeInvestigationTargetId: undefined,
  procedureLog: [],
  debugVisible: false,
  hasSave: false,
  loading: false,
  settings: {
    musicEnabled: false,
    soundEnabled: true,
    captionsEnabled: true,
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
      },
      debugVisible: save.debugVisible,
    })
  },
  startNewGame: async () => {
    clearSaveGame()
    set({
      screen: 'identity',
      world: initialWorldState,
      storyView: null,
      storyStateJson: undefined,
      actionFeedback: [],
      investigationFeedback: {},
      activeInvestigationTargetId: undefined,
      procedureLog: [],
      hasSave: false,
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
      set({ hasSave: false, error: '未找到可用记录。' })
      return
    }

    set({ loading: true, error: undefined })
    try {
      activeStory = await loadInkStory(DEFAULT_STORY_PATH, save.world.protagonist.displayName)
      if (save.storyStateJson) activeStory.state.LoadJson(save.storyStateJson)
      applyProtagonistName(activeStory, save.world.protagonist.displayName)
      const storyView = save.storyView ?? collectStoryView(activeStory)
      set({
        screen: save.screen === 'identity' ? 'identity' : 'playing',
        world: save.world,
        storyView,
        storyStateJson: save.storyStateJson,
        actionFeedback: save.actionFeedback ?? [],
        investigationFeedback: save.investigationFeedback ?? {},
        activeInvestigationTargetId: undefined,
        procedureLog: save.procedureLog ?? [],
        debugVisible: save.debugVisible,
        settings: {
          musicEnabled: save.musicEnabled,
          soundEnabled: save.soundEnabled,
          captionsEnabled: save.captionsEnabled,
        },
        hasSave: true,
        loading: false,
      })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : '无法恢复记录。' })
    }
  },
  selectAction: (actionId) => {
    if (!activeStory) return

    const choiceIndex = Number(actionId)
    if (Number.isNaN(choiceIndex)) return

    const { view, effect } = chooseInkChoice(activeStory, choiceIndex)
    const selectedChoice = get().storyView?.choices.find((choice) => choice.id === actionId)
    const world = applyChoiceEffect(get().world, effect)
    const receiptEntries = (effect.receipts ?? view.receipts).map((receipt, index) => ({
      id: `${Date.now()}-${index}`,
      title: '手续回执',
      summary: receipt,
    }))
    const storyStateJson = snapshotInkStory(activeStory, view).storyStateJson
    const isInlineFeedback = view.tags.some((tag) => tag.trim() === 'ui:feedback')

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
      actionFeedback: isInlineFeedback ? [] : view.paragraphs,
      investigationFeedback:
        isInlineFeedback && selectedChoice
          ? {
              ...state.investigationFeedback,
              [selectedChoice.targetId]: [
                ...view.paragraphs,
                ...(state.investigationFeedback[selectedChoice.targetId] ?? []),
              ].slice(0, 6),
            }
          : state.investigationFeedback,
      activeInvestigationTargetId:
        isInlineFeedback && selectedChoice ? selectedChoice.targetId : state.activeInvestigationTargetId,
      storyStateJson,
      procedureLog: [...receiptEntries, ...state.procedureLog].slice(0, 12),
      hasSave: true,
    }))
    persist()
  },
  openScreen: (screen) => {
    set({ screen })
    persist()
  },
  openInvestigation: (targetId) => {
    set({ activeInvestigationTargetId: targetId })
  },
  closeInvestigation: () => {
    set({ activeInvestigationTargetId: undefined })
  },
  backToMenu: () => {
    set({ screen: 'mainMenu', error: undefined })
    persist()
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
}))

async function beginChapterOne(): Promise<void> {
  const setState = useGameStore.setState
  try {
    activeStory = await loadInkStory(DEFAULT_STORY_PATH, useGameStore.getState().world.protagonist.displayName)
    const storyView = collectStoryView(activeStory)
    const storyStateJson = snapshotInkStory(activeStory, storyView).storyStateJson
    setState({
      screen: 'playing',
      storyView,
      storyStateJson,
      actionFeedback: [],
      investigationFeedback: {},
      activeInvestigationTargetId: undefined,
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
    storyView: state.storyView ?? undefined,
    actionFeedback: state.actionFeedback,
    investigationFeedback: state.investigationFeedback,
    world: state.world,
    procedureLog: state.procedureLog,
    debugVisible: state.debugVisible,
    musicEnabled: state.settings.musicEnabled,
    soundEnabled: state.settings.soundEnabled,
    captionsEnabled: state.settings.captionsEnabled,
  })
}

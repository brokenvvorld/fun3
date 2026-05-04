import { waitFor } from '@testing-library/react'
import { Compiler } from 'inkjs/full'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSaveGame } from './saveGame'
import { useGameStore } from './gameStore'
import { initialWorldState } from '../../game/simulation/state'

const storyJson = new Compiler(`
VAR protagonist_name = "未核验姓名"

-> start

=== start ===
# screen:title=测试调查场景
# screen:location=测试窗口
# choice:0:group=machine
# choice:0:target=stamp_machine
# choice:0:label=盖章机
# choice:0:mode=inspect
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=decision
# choice:1:target=procedure
# choice:1:label=下一步
# choice:1:mode=advance
# choice:1:surface=next_step
# choice:1:repeatable=false
窗口正在等待。
+ [查看盖章机]
  # ui:feedback
  # exposure:+9
  # companion:lin_xiaoman=疲惫,trust:+5
  # receipt:调查回执不应入账
  盖章机只是在空转。
  -> start
* [继续办理]
  # exposure:+4
  # companion:lin_xiaoman=稳定,trust:+2
  # receipt:推进回执应入账
  -> next_scene

=== next_scene ===
# screen:title=测试推进场景
# screen:location=测试后续窗口
# choice:0:group=decision
# choice:0:target=procedure
# choice:0:label=继续
# choice:0:mode=advance
# choice:0:surface=next_step
# choice:0:repeatable=false
手续推进了。
+ [继续]
  -> DONE
`).Compile().ToJson() as string

describe('game store narrative interactions', () => {
  beforeEach(async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        text: async () => storyJson,
      })),
    )
    clearSaveGame()
    await useGameStore.getState().startNewGame()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps repeatable investigation feedback from applying world effects', async () => {
    useGameStore.getState().setProtagonistName('测试人')

    await waitFor(() => {
      expect(useGameStore.getState().storyView?.title).toBe('测试调查场景')
    })

    const initial = useGameStore.getState()
    const inspectChoice = initial.storyView?.choices.find((choice) => choice.surface === 'modal')
    const nextStepChoice = initial.storyView?.choices.find((choice) => choice.surface === 'next_step')

    expect(inspectChoice).toBeDefined()
    expect(nextStepChoice).toBeDefined()

    useGameStore.getState().selectAction(inspectChoice?.id ?? '0')

    const afterInspect = useGameStore.getState()
    expect(afterInspect.world.anomalyExposure.global).toBe(initial.world.anomalyExposure.global)
    expect(afterInspect.world.companions.lin_xiaoman.trust).toBe(initial.world.companions.lin_xiaoman.trust)
    expect(afterInspect.procedureLog).toHaveLength(0)
    expect(afterInspect.investigationFeedback.stamp_machine).toEqual(['盖章机只是在空转。'])
    expect(afterInspect.storyView?.title).toBe('测试调查场景')

    useGameStore.getState().selectAction(nextStepChoice?.id ?? '1')

    const afterAdvance = useGameStore.getState()
    expect(afterAdvance.world.anomalyExposure.global).toBe(initial.world.anomalyExposure.global + 4)
    expect(afterAdvance.world.companions.lin_xiaoman.trust).toBe(initial.world.companions.lin_xiaoman.trust + 2)
    expect(afterAdvance.procedureLog[0]).toMatchObject({
      title: '手续回执',
      summary: '推进回执应入账',
    })
  })

  it('does not overwrite an existing save when backing out of a new-game registration', async () => {
    const existingSave = {
      version: 2,
      screen: 'playing',
      storyStateJson: undefined,
      world: {
        ...initialWorldState,
        protagonist: {
          ...initialWorldState.protagonist,
          displayName: '旧记录',
          registryNameStatus: '已填报',
          registryNumber: 'LC-REG-OLD',
        },
      },
      investigationFeedback: {},
      procedureLog: [
        {
          id: 'old-receipt',
          title: '手续回执',
          summary: '旧记录回执',
        },
      ],
      debugVisible: false,
      musicEnabled: false,
      soundEnabled: true,
      captionsEnabled: true,
    }
    const existingSaveJson = JSON.stringify(existingSave)
    window.localStorage.setItem('fun3.chapter1.save.v2', existingSaveJson)

    await useGameStore.getState().startNewGame()

    expect(useGameStore.getState().screen).toBe('identity')
    expect(useGameStore.getState().hasSave).toBe(true)
    expect(window.localStorage.getItem('fun3.chapter1.save.v2')).toBe(existingSaveJson)

    useGameStore.getState().backToMenu()

    expect(useGameStore.getState().screen).toBe('mainMenu')
    expect(window.localStorage.getItem('fun3.chapter1.save.v2')).toBe(existingSaveJson)

    await useGameStore.getState().continueGame()

    await waitFor(() => {
      expect(useGameStore.getState().world.protagonist.displayName).toBe('旧记录')
    })
    expect(useGameStore.getState().procedureLog[0]?.summary).toBe('旧记录回执')
  })

  it('keeps saved procedure logs hydrated before continuing a refreshed session', async () => {
    window.localStorage.setItem(
      'fun3.chapter1.save.v2',
      JSON.stringify({
        version: 2,
        screen: 'playing',
        storyStateJson: undefined,
        world: {
          ...initialWorldState,
          protagonist: {
            ...initialWorldState.protagonist,
            displayName: '刷新记录',
            registryNameStatus: '已填报',
            registryNumber: 'LC-REG-REFRESH',
          },
        },
        investigationFeedback: {},
        procedureLog: [{ id: 'refresh-receipt', title: '手续回执', summary: '刷新后仍应保留' }],
        debugVisible: false,
        musicEnabled: false,
        soundEnabled: true,
        captionsEnabled: true,
      }),
    )

    useGameStore.getState().boot()

    expect(useGameStore.getState().screen).toBe('mainMenu')
    expect(useGameStore.getState().world.protagonist.displayName).toBe('刷新记录')
    expect(useGameStore.getState().procedureLog[0]?.summary).toBe('刷新后仍应保留')

    useGameStore.getState().openScreen('settings')
    useGameStore.getState().returnToPreviousScreen()
    await useGameStore.getState().continueGame()

    await waitFor(() => {
      expect(useGameStore.getState().storyView?.title).toBe('测试调查场景')
    })
    expect(useGameStore.getState().procedureLog[0]?.summary).toBe('刷新后仍应保留')
  })

  it('returns auxiliary screens to the active story when they were opened during play', async () => {
    useGameStore.getState().setProtagonistName('测试人')

    await waitFor(() => {
      expect(useGameStore.getState().storyView?.title).toBe('测试调查场景')
    })

    useGameStore.getState().openScreen('codex')

    expect(useGameStore.getState().screen).toBe('codex')
    expect(useGameStore.getState().returnScreen).toBe('playing')

    useGameStore.getState().returnToPreviousScreen()

    expect(useGameStore.getState().screen).toBe('playing')
    expect(useGameStore.getState().returnScreen).toBeUndefined()
    expect(useGameStore.getState().storyView?.title).toBe('测试调查场景')
  })

  it('returns auxiliary screens to the main menu when no playable story is available', async () => {
    useGameStore.setState({ screen: 'mainMenu', storyView: null, returnScreen: undefined })

    useGameStore.getState().openScreen('settings')

    expect(useGameStore.getState().screen).toBe('settings')
    expect(useGameStore.getState().returnScreen).toBeUndefined()

    useGameStore.getState().returnToPreviousScreen()

    expect(useGameStore.getState().screen).toBe('mainMenu')

    useGameStore.setState({ screen: 'archive', storyView: null, returnScreen: 'playing' })
    useGameStore.getState().returnToPreviousScreen()

    expect(useGameStore.getState().screen).toBe('mainMenu')
    expect(useGameStore.getState().returnScreen).toBeUndefined()
  })

  it('changes visible text speed within runtime bounds without changing save schema', async () => {
    expect(useGameStore.getState().settings.textSpeed).toBe('standard')

    useGameStore.getState().changeTextSpeed('faster')
    useGameStore.getState().changeTextSpeed('faster')

    expect(useGameStore.getState().settings.textSpeed).toBe('fast')

    useGameStore.getState().changeTextSpeed('slower')
    useGameStore.getState().changeTextSpeed('slower')
    useGameStore.getState().changeTextSpeed('slower')

    expect(useGameStore.getState().settings.textSpeed).toBe('slow')
    expect(window.localStorage.getItem('fun3.chapter1.save.v2') ?? '').not.toContain('textSpeed')
  })

  it('rebuilds the visible story view from Ink state when continuing a save', async () => {
    window.localStorage.setItem(
      'fun3.chapter1.save.v2',
      JSON.stringify({
        version: 2,
        screen: 'playing',
        storyStateJson: undefined,
        storyView: {
          title: '旧存档标题',
          location: '旧地点',
          paragraphs: ['旧正文'],
          choices: [],
          notices: ['notice:old'],
          receipts: ['receipt:old'],
          tags: ['choice:0:surface=modal'],
          isComplete: true,
        },
        world: {
          ...initialWorldState,
          protagonist: {
            ...initialWorldState.protagonist,
            displayName: '测试人',
          },
        },
        investigationFeedback: { stale: ['旧调查反馈'] },
        procedureLog: [],
        debugVisible: false,
        musicEnabled: false,
        soundEnabled: true,
        captionsEnabled: true,
      }),
    )

    await useGameStore.getState().continueGame()

    await waitFor(() => {
      expect(useGameStore.getState().storyView?.title).toBe('测试调查场景')
    })
    expect(useGameStore.getState().storyView?.paragraphs).toEqual(['窗口正在等待。'])
    expect(useGameStore.getState().storyView?.choices).toHaveLength(2)
    expect(useGameStore.getState().storyView?.choices[0]).toMatchObject({
      label: '查看盖章机',
      surface: 'modal',
      repeatable: true,
    })
  })

  it('saves the unread section state so continuing restores the current copy', async () => {
    useGameStore.getState().setProtagonistName('测试人')

    await waitFor(() => {
      expect(useGameStore.getState().storyView?.title).toBe('测试调查场景')
    })

    const nextStepChoice = useGameStore
      .getState()
      .storyView?.choices.find((choice) => choice.surface === 'next_step')
    useGameStore.getState().selectAction(nextStepChoice?.id ?? '1')

    await waitFor(() => {
      expect(useGameStore.getState().storyView?.title).toBe('测试推进场景')
    })
    expect(useGameStore.getState().storyView?.paragraphs).toEqual(['手续推进了。'])

    useGameStore.setState({ screen: 'mainMenu', storyView: null, storyStateJson: undefined })

    await useGameStore.getState().continueGame()

    await waitFor(() => {
      expect(useGameStore.getState().storyView?.title).toBe('测试推进场景')
    })
    expect(useGameStore.getState().storyView?.location).toBe('测试后续窗口')
    expect(useGameStore.getState().storyView?.paragraphs).toEqual(['手续推进了。'])
    expect(useGameStore.getState().storyView?.choices[0]).toMatchObject({
      label: '继续',
      surface: 'next_step',
    })
  })

  it('clears a save when the stored Ink state cannot be restored', async () => {
    window.localStorage.setItem(
      'fun3.chapter1.save.v2',
      JSON.stringify({
        version: 2,
        screen: 'playing',
        storyStateJson: '{}',
        world: {
          ...initialWorldState,
          protagonist: {
            ...initialWorldState.protagonist,
            displayName: '测试人',
          },
        },
        investigationFeedback: {},
        procedureLog: [],
        debugVisible: false,
        musicEnabled: false,
        soundEnabled: true,
        captionsEnabled: true,
      }),
    )

    await useGameStore.getState().continueGame()

    expect(useGameStore.getState().hasSave).toBe(false)
    expect(useGameStore.getState().loading).toBe(false)
    expect(useGameStore.getState().error).toBe('记录已损坏，请重新开始。')
    expect(window.localStorage.getItem('fun3.chapter1.save.v2')).toBeNull()
  })
})

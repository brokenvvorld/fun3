import { waitFor } from '@testing-library/react'
import { Compiler } from 'inkjs/full'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSaveGame, saveGame } from './saveGame'
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
  手续推进了。
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

  it('rebuilds the visible story view from Ink state when continuing a save', async () => {
    saveGame({
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
    })

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
})

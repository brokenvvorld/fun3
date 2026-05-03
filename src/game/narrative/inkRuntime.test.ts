import { Compiler } from 'inkjs/full'
import { afterEach, describe, expect, it, vi } from 'vitest'
import bundledStoryJson from '../../../public/stories/chapter-1.json?raw'
import {
  buildStoryAssetPath,
  chooseInkChoice,
  collectStoryView,
  loadInkStory,
  parseEffectTags,
  restoreInkStory,
} from './inkRuntime'

const storyJson = new Compiler(`
-> start

=== start ===
# screen:title=测试窗口
# screen:location=测试地点
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
第一段正文。
* [查看机器]
  # ui:feedback
  机器正在等纸。
  -> start
* [办理手续]
  # effect:flag=test_flag,true
  # exposure:+7
  # faction:queue_management=交易
  # district:service_center=贴封管控
  # companion:lin_xiaoman=疲惫,trust:+3
  # receipt:测试回执
  手续已经办完。
  -> DONE
`).Compile().ToJson() as string

describe('ink runtime', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds the bundled story path relative to the deployed app base path', () => {
    expect(buildStoryAssetPath('./')).toBe('./stories/chapter-1.json')
    expect(buildStoryAssetPath('/fun3/')).toBe('/fun3/stories/chapter-1.json')
  })

  it('loads the bundled story from the configured app base path', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      text: async () => storyJson,
    })) as unknown as typeof fetch

    vi.stubGlobal('fetch', fetchMock)

    await loadInkStory()

    expect(fetchMock).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}stories/chapter-1.json`)
  })

  it('collects paragraphs and maps choices', () => {
    const story = restoreInkStory(storyJson)
    const view = collectStoryView(story)

    expect(view.title).toBe('测试窗口')
    expect(view.location).toBe('测试地点')
    expect(view.paragraphs).toEqual(['第一段正文。'])
    expect(view.choices[0]).toMatchObject({
      label: '查看机器',
      kind: 'inspect',
      group: 'machine',
      targetId: 'stamp_machine',
      targetLabel: '盖章机',
      mode: 'inspect',
      surface: 'modal',
      repeatable: true,
    })
    expect(view.choices[1]).toMatchObject({
      label: '办理手续',
      kind: 'advance',
      group: 'decision',
      surface: 'next_step',
      repeatable: false,
    })
  })

  it('keeps the bundled compiled chapter connected to the chapter_1 entry', () => {
    const story = restoreInkStory(bundledStoryJson)
    const view = collectStoryView(story)

    expect(view.title).toBe('第一章：补办窗口不会等人')
    expect(view.paragraphs.length).toBeGreaterThan(0)
    expect(view.choices).toHaveLength(1)
    expect(view.choices[0]).toMatchObject({
      label: '走向一号窗口，接过那张正在吐出的号票',
      group: 'decision',
      surface: 'next_step',
    })
    expect(view.choices[0].label).not.toContain('choice:')
  })

  it('keeps a default next-step path through the bundled chapter', () => {
    const story = restoreInkStory(bundledStoryJson)
    let view = collectStoryView(story)
    const visitedTitles: string[] = []

    for (let step = 0; step < 100 && !view.isComplete; step += 1) {
      visitedTitles.push(view.title)
      const nextChoice = view.choices.find((choice) => choice.surface === 'next_step')
      expect(nextChoice, `Missing next-step choice at ${view.title}`).toBeDefined()
      expect(nextChoice?.label).not.toContain('choice:')

      view = chooseInkChoice(story, nextChoice?.index ?? 0).view
    }

    expect(view.isComplete).toBe(true)
    expect(visitedTitles).toContain('第一章：第一处机枢渗水点')
  })

  it('keeps sibling next-step choices on the default route playable', () => {
    const story = restoreInkStory(bundledStoryJson)
    let view = collectStoryView(story)

    for (let step = 0; step < 100 && !view.isComplete; step += 1) {
      const stateBeforeChoice = story.state.ToJson()
      const nextChoices = view.choices.filter((choice) => choice.surface === 'next_step')
      expect(nextChoices.length, `Missing next-step choices at ${view.title}`).toBeGreaterThan(0)

      for (const choice of nextChoices) {
        const branchStory = restoreInkStory(bundledStoryJson, stateBeforeChoice)
        const branchView = chooseInkChoice(branchStory, choice.index).view
        const branchNextChoices = branchView.choices.filter((branchChoice) => branchChoice.surface === 'next_step')

        expect(branchView.paragraphs.length, `Empty branch after ${view.title} / ${choice.label}`).toBeGreaterThan(0)
        expect(branchView.choices.some((branchChoice) => branchChoice.label.includes('choice:'))).toBe(false)
        expect(
          branchView.isComplete || branchNextChoices.length > 0,
          `Branch has no next-step after ${view.title} / ${choice.label}`,
        ).toBe(true)
      }

      view = chooseInkChoice(story, nextChoices[0].index).view
    }

    expect(view.isComplete).toBe(true)
  })

  it('keeps untagged execution choices in the next-step surface', () => {
    const story = restoreInkStory(
      new Compiler(`
-> start

=== start ===
执行类动作不应该被默认塞进调查窗口。
* [把材料递到窗口边缘]
  -> DONE
`).Compile().ToJson() as string,
    )
    const view = collectStoryView(story)

    expect(view.choices[0]).toMatchObject({
      label: '把材料递到窗口边缘',
      kind: 'advance',
      surface: 'next_step',
      repeatable: false,
    })
  })

  it('advances a choice and parses effect tags', () => {
    const story = restoreInkStory(storyJson)
    collectStoryView(story)
    const { view, effect } = chooseInkChoice(story, 1)

    expect(view.paragraphs).toEqual(['手续已经办完。'])
    expect(effect.flags?.test_flag).toBe(true)
    expect(effect.exposureDelta).toBe(7)
    expect(effect.factions?.queue_authority).toBe('交易')
    expect(effect.districts?.community_service_center).toBe('贴封管控')
    expect(effect.companions?.[0]).toMatchObject({
      id: 'lin_xiaoman',
      condition: '疲惫',
      trustDelta: 3,
    })
    expect(effect.receipts).toEqual(['测试回执'])
  })

  it('normalizes district status aliases used by story-facing tags', () => {
    const effect = parseEffectTags(['district:temporary_shelter=临时避难'])
    expect(effect.districts).toEqual({ temporary_shelter: '照常通行' })
  })
})

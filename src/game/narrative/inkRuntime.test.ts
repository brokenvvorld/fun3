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

  it('preserves the opening premise and Lin Xiaoman motivation', () => {
    const story = restoreInkStory(bundledStoryJson)
    const openingView = collectStoryView(story)
    const openingText = openingView.paragraphs.join('\n')

    expect(openingText).toContain('不是来选择出身或职业的人')
    expect(openingText).toContain('登记姓名刚在一号窗口前填过')
    expect(openingText).toContain('林小满不是突然来搭话的人')
    expect(openingText).toContain('熟客名单')
    expect(openingText).toContain('临期酸奶')

    const zoneAView = chooseInkChoice(story, openingView.choices[0].index).view
    const zoneAText = zoneAView.paragraphs.join('\n')

    expect(zoneAText).toContain('不是去当工作人员')
    expect(zoneAText).toContain('没有给未核验姓名胸牌')
    expect(zoneAText).toContain('没有获得权力，只是被推到了责任最容易落下来的位置')
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

  it('keeps all reachable next-step branches connected', () => {
    const initialStory = restoreInkStory(bundledStoryJson)
    const initialView = collectStoryView(initialStory)
    const queue: Array<{ stateJson: string; path: string[]; view: typeof initialView }> = [
      {
        stateJson: initialStory.state.ToJson(),
        path: [initialView.title],
        view: initialView,
      },
    ]
    const visitedScenes = new Set<string>()
    const visitedTitles = new Set<string>()
    let completedBranches = 0

    while (queue.length > 0) {
      const current = queue.shift()
      expect(current).toBeDefined()
      if (!current) break

      const nextChoices = current.view.choices.filter((choice) => choice.surface === 'next_step')
      const sceneKey = `${current.view.title}:${nextChoices.map((choice) => choice.label).join('|')}`
      if (visitedScenes.has(sceneKey)) continue
      visitedScenes.add(sceneKey)
      visitedTitles.add(current.view.title)

      if (current.view.isComplete) {
        completedBranches += 1
        continue
      }

      expect(nextChoices.length, `Missing next-step choices at ${current.path.join(' -> ')}`).toBeGreaterThan(0)

      for (const choice of nextChoices) {
        const branchStory = restoreInkStory(bundledStoryJson, current.stateJson)
        const branchView = chooseInkChoice(branchStory, choice.index).view

        expect(
          branchView.paragraphs.length,
          `Empty branch after ${current.view.title} / ${choice.label}`,
        ).toBeGreaterThan(0)
        expect(branchView.choices.some((branchChoice) => branchChoice.label.includes('choice:'))).toBe(false)

        queue.push({
          stateJson: branchStory.state.ToJson(),
          path: [...current.path, choice.label, branchView.title],
          view: branchView,
        })
      }

      expect(visitedScenes.size, 'Reachable next-step graph exceeded traversal budget').toBeLessThan(220)
    }

    expect(completedBranches).toBeGreaterThan(0)
    expect(visitedTitles).toContain('第一章：第一处机枢渗水点')
    expect(visitedTitles).toContain('第一章：现场记录归档')
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

import { Compiler } from 'inkjs/full'
import type { Story } from 'inkjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import bundledStoryJson from '../../../public/stories/chapter-1.json?raw'
import chapterOneInk from './ink/chapter-1.ink?raw'
import chapterOneZoneAInk from './ink/chapter-1-zone-a.ink?raw'
import chapterOneZoneBInk from './ink/chapter-1-zone-b.ink?raw'
import chapterOneZoneCInk from './ink/chapter-1-zone-c.ink?raw'
import {
  buildStoryAssetPath,
  chooseInkChoice,
  chooseInkReadingChoice,
  collectReadingFrame,
  collectStoryView,
  loadInkStory,
  parseEffectTags,
  restoreInkStory,
  type InkStoryView,
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

  it('marks legacy chapter ink as framework test stubs instead of final story', () => {
    expect(chapterOneInk).toContain('互动小说框架测试桩')
    expect(chapterOneInk).toContain('FINAL_REWRITE_ACTIVE: 第八轮第一章新框架入口')
    expect(chapterOneInk).toContain('LEGACY_ZONES_DISCONNECTED')
    expect(chapterOneInk).toContain('FROZEN_COMPAT_ONLY: 第二章冻结兼容测试入口')
    expect(chapterOneInk).toContain('DO_NOT_EXPAND_CHAPTER_2')

    for (const source of [chapterOneZoneAInk, chapterOneZoneBInk, chapterOneZoneCInk]) {
      expect(source).toContain('TEST_STUB_KEEP')
      expect(source).toContain('REWRITE_LATER')
      expect(source).toContain('不再当最终第一章修补')
    }
  })

  it('builds the bundled story path relative to the deployed app base path', () => {
    expect(buildStoryAssetPath('')).toBe('stories/chapter-1.json')
    expect(buildStoryAssetPath('./')).toBe('./stories/chapter-1.json')
    expect(buildStoryAssetPath('/fun3/')).toBe('/fun3/stories/chapter-1.json')
    expect(buildStoryAssetPath('/fun3')).toBe('/fun3/stories/chapter-1.json')
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

  it('collects one reading frame at a time before showing actions', () => {
    const story = restoreInkStory(
      new Compiler(`
-> start

=== start ===
# screen:title=逐帧测试
# screen:location=一号窗口
# choice:0:group=document
# choice:0:target=receipt
# choice:0:label=回执
# choice:0:mode=inspect
# choice:0:surface=modal
# choice:0:repeatable=true
# choice:1:group=decision
# choice:1:target=procedure
# choice:1:label=窗口手续
# choice:1:mode=advance
# choice:1:surface=next_step
# choice:1:repeatable=false
第一帧正文。
第二帧正文。
* [查看回执]
  # ui:feedback
  回执上有水印。
  -> start
* [交给窗口]
  # effect:flag=reading_frame_choice,true
  # receipt:逐帧选择回执
  手续进入下一栏。
  -> DONE
`).Compile().ToJson() as string,
    )

    const firstFrame = collectReadingFrame(story)
    expect(firstFrame).toMatchObject({
      title: '逐帧测试',
      location: '一号窗口',
      text: ['第一帧正文。'],
      canContinue: true,
      choices: [],
      investigations: [],
      isComplete: false,
    })

    const secondFrame = collectReadingFrame(story)
    expect(secondFrame).toMatchObject({
      title: '逐帧测试',
      location: '一号窗口',
      text: ['第二帧正文。'],
      canContinue: false,
      isComplete: false,
    })
    expect(secondFrame.investigations).toEqual([
      expect.objectContaining({
        label: '查看回执',
        kind: 'inspect',
        targetId: 'receipt',
        targetLabel: '回执',
        surface: 'modal',
        repeatable: true,
      }),
    ])
    expect(secondFrame.choices).toEqual([
      expect.objectContaining({
        label: '交给窗口',
        kind: 'advance',
        targetId: 'procedure',
        targetLabel: '窗口手续',
        surface: 'next_step',
        repeatable: false,
      }),
    ])
  })

  it('keeps reading-frame investigations separate from mainline decisions', () => {
    const story = restoreInkStory(storyJson)
    const frame = collectReadingFrame(story)

    expect(frame.text).toEqual(['第一段正文。'])
    expect(frame.investigations.map((choice) => choice.label)).toEqual(['查看机器'])
    expect(frame.choices.map((choice) => choice.label)).toEqual(['办理手续'])

    const investigationResult = chooseInkReadingChoice(story, frame.investigations[0].index)
    expect(investigationResult.frame.text).toEqual(['机器正在等纸。'])
    expect(investigationResult.effect).toMatchObject({
      flags: {},
      irreversibleFlags: {},
      districts: {},
      factions: {},
      companions: [],
      receipts: [],
    })
  })

  it('parses reading-frame effects only from the current frame tags', () => {
    const story = restoreInkStory(storyJson)
    let frame = collectReadingFrame(story)

    const result = chooseInkReadingChoice(story, frame.choices[0].index)
    frame = result.frame

    expect(frame.text).toEqual(['手续已经办完。'])
    expect(frame.effect.flags?.test_flag).toBe(true)
    expect(frame.effect.exposureDelta).toBe(7)
    expect(frame.effect.factions?.queue_authority).toBe('交易')
    expect(frame.effect.receipts).toEqual(['测试回执'])
    expect(result.effect).toEqual(frame.effect)
  })

  it('normalizes whitespace around public notice and receipt tags', () => {
    const story = restoreInkStory(
      new Compiler(`
-> start

=== start ===
#  notice: trimmed_notice=可见告示
#  notice: trimmed_notice=可见告示
#  notice:
#  receipt: trimmed_receipt=可见回执
#  receipt: trimmed_receipt=可见回执
#  receipt:
正文。
-> DONE
`).Compile().ToJson() as string,
    )
    const view = collectStoryView(story)

    expect(view.notices).toEqual(['trimmed_notice=可见告示'])
    expect(view.receipts).toEqual(['trimmed_receipt=可见回执'])
  })

  it('normalizes screen metadata and ignores empty overrides', () => {
    const story = restoreInkStory(
      new Compiler(`
-> start

=== start ===
# screen:title =
# screen:location =
# screen:title = 第一章测试标题
# screen:location = 一号窗口
正文。
-> DONE
`).Compile().ToJson() as string,
    )
    const view = collectStoryView(story)

    expect(view.title).toBe('第一章测试标题')
    expect(view.location).toBe('一号窗口')
  })

  it('normalizes whitespace inside choice metadata tags', () => {
    const story = restoreInkStory(
      new Compiler(`
-> start

=== start ===
# choice:0:GROUP = Document
# choice:0:target = permit_copy
# choice:0:label = 通行条复印件
# choice:0:mode = Compare
# choice:0:SURFACE = Modal
# choice:0:repeatable = TRUE
窗口边放着一张复印件。
* [核对通行条复印件]
  -> DONE
`).Compile().ToJson() as string,
    )
    const view = collectStoryView(story)

    expect(view.choices[0]).toMatchObject({
      group: 'document',
      targetId: 'permit_copy',
      targetLabel: '通行条复印件',
      mode: 'compare',
      surface: 'modal',
      repeatable: true,
    })
  })

  it('ignores empty or invalid choice metadata overrides', () => {
    const story = restoreInkStory(
      new Compiler(`
-> start

=== start ===
# choice:0:group = document
# choice:0:target =
# choice:0:label =
# choice:0:surface = modal
# choice:0:repeatable = maybe
窗口边放着一张材料。
* [核对材料]
  -> DONE
`).Compile().ToJson() as string,
    )
    const view = collectStoryView(story)

    expect(view.choices[0]).toMatchObject({
      group: 'document',
      targetId: 'documents',
      targetLabel: '文件',
      surface: 'modal',
      repeatable: true,
    })
  })

  it('keeps the bundled compiled chapter connected to the chapter_1 entry', () => {
    const story = restoreInkStory(bundledStoryJson)
    const view = collectStoryView(story)

    expect(view.title).toBe('第一章：补办窗口不会等人')
    expect(view.paragraphs.length).toBeGreaterThan(0)
    expect(view.choices).toHaveLength(6)
    expect(view.choices.filter((choice) => choice.surface === 'modal' && choice.repeatable)).toHaveLength(4)
    expect(view.choices.filter((choice) => choice.surface === 'next_step' && !choice.repeatable)).toHaveLength(2)
    expect(view.choices.find((choice) => choice.label === '压住补办号票，确认截止时间')).toMatchObject({
      group: 'document',
      surface: 'modal',
    })
    expect(view.choices.find((choice) => choice.label === '把熟客名单摊在窗口边，请队伍先按名字应声')).toMatchObject({
      group: 'procedure',
      surface: 'next_step',
    })
    expect(view.choices.some((choice) => choice.label.includes('choice:'))).toBe(false)
  })

  it('keeps the rewritten opening readable before the first action hub', () => {
    const story = restoreInkStory(bundledStoryJson)
    const firstFrame = collectReadingFrame(story)
    const secondFrame = collectReadingFrame(story)
    const aggregatedView = collectStoryView(restoreInkStory(bundledStoryJson))
    const openingText = aggregatedView.paragraphs.join('\n')

    expect(firstFrame.text).toEqual(['一号窗口还没开，取号机已经把未核验姓名的号吐出来。纸条带着热，补办编号清楚，姓名栏却写着“待归档”。'])
    expect(firstFrame.canContinue).toBe(true)
    expect(firstFrame.choices).toHaveLength(0)
    expect(secondFrame.text.join('\n')).toContain('临时通行条必须补齐')
    expect(secondFrame.canContinue).toBe(true)

    expect(openingText).toContain('周婶')
    expect(openingText).toContain('傍晚错峰复核前，临时通行条必须补齐')
    expect(openingText).toContain('姓名栏却写着“待归档”')
    expect(openingText).toContain('周婶那一行只剩楼栋')
    expect(openingText).toContain('熟客名单')
    expect(openingText).toContain('酸奶清点表')
    expect(aggregatedView.choices.map((choice) => choice.label)).toEqual([
      '压住补办号票，确认截止时间',
      '请林小满指出名单上空掉的那一行',
      '查看通行条复印申请里有没有周婶',
      '翻看酸奶清点表，找周婶和孩子的记录',
      '把熟客名单摊在窗口边，请队伍先按名字应声',
      '先把补办号票递进窗口，要求保留自己的姓名栏',
    ])
  })

  it('keeps concrete investigations and costly decisions in the rewritten first chapter', () => {
    const story = restoreInkStory(bundledStoryJson)
    let view = collectStoryView(story)

    view = chooseBundledChoice(story, view, '把熟客名单摊在窗口边，请队伍先按名字应声')
    expect(view.title).toBe('第一章：配给章盒')
    expect(view.receipts).toContain('LC-IX-002=临时通行条复印件待核验')
    expect(view.choices.filter((choice) => choice.surface === 'modal' && choice.repeatable)).toHaveLength(3)
    expect(view.choices.filter((choice) => choice.surface === 'next_step' && !choice.repeatable)).toHaveLength(3)

    const stateBeforeStampChoice = story.state.ToJson()
    const stampExpectations = [
      {
        label: '撕下错误回执，按现场应声的人重填在场名单',
        outcome: 'restore_present_names',
        receipt: 'LC-IX-001 配给盖章机已记录：恢复在场名单',
      },
      {
        label: '把未到场名额单独夹出，给可能还在路上的人留位置',
        outcome: 'hold_late_arrivals',
        receipt: 'LC-IX-001 配给盖章机已记录：保留未到场名额',
      },
      {
        label: '把章盒贴封，要求窗口人工核验通行资格',
        outcome: 'seal_stamp_box',
        receipt: 'LC-IX-001 配给盖章机已记录：贴封停用',
      },
    ]

    for (const expectation of stampExpectations) {
      const branchStory = restoreInkStory(bundledStoryJson, stateBeforeStampChoice)
      const branchView = collectStoryView(branchStory)
      const branchChoice = branchView.choices.find((choice) => choice.label === expectation.label)
      expect(branchChoice, `Missing stamp branch "${expectation.label}"`).toBeDefined()
      const branchResult = chooseInkChoice(branchStory, branchChoice?.index ?? 0)

      expect(branchResult.view.title).toBe('第一章：熟客名单缺页')
      expect(branchResult.effect.flags?.ch1_registry_outcome).toBe(expectation.outcome)
      expect(branchResult.effect.receipts).toContain(expectation.receipt)
      expect(
        branchResult.effect.receipts?.some((receipt) => receipt.includes('LC-IX-002 临时通行条复印件已记录')),
      ).toBe(true)
    }
  })

  it('keeps a default next-step path through the bundled chapter', () => {
    const story = restoreInkStory(bundledStoryJson)
    let view = collectStoryView(story)
    const visitedTitles: string[] = []

    for (let step = 0; step < 30 && view.title !== '第一章：现场记录归档'; step += 1) {
      visitedTitles.push(view.title)
      const nextChoice = view.choices.find((choice) => choice.surface === 'next_step')
      expect(nextChoice, `Missing next-step choice at ${view.title}`).toBeDefined()
      expect(nextChoice?.label).not.toContain('choice:')

      view = chooseInkChoice(story, nextChoice?.index ?? 0).view
    }

    expect(view.title).toBe('第一章：现场记录归档')
    expect(visitedTitles).toContain('第一章：配给章盒')
    expect(visitedTitles).toContain('第一章：熟客名单缺页')
    expect(visitedTitles).toContain('第一章：第一处机枢渗水点')
  })

  it('keeps sibling next-step choices on the default route playable', () => {
    const story = restoreInkStory(bundledStoryJson)
    let view = collectStoryView(story)

    for (let step = 0; step < 30 && view.title !== '第一章：现场记录归档'; step += 1) {
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

    expect(view.title).toBe('第一章：现场记录归档')
  })

  it('keeps all reachable first-chapter next-step branches connected', () => {
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

      if (current.view.isComplete || current.view.title === '第一章：现场记录归档') {
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

        if (branchView.title !== '第二章：换乘站台在移动') {
          queue.push({
            stateJson: branchStory.state.ToJson(),
            path: [...current.path, choice.label, branchView.title],
            view: branchView,
          })
        }
      }

      expect(visitedScenes.size, 'Reachable next-step graph exceeded traversal budget').toBeLessThan(80)
    }

    expect(completedBranches).toBeGreaterThan(0)
    expect(visitedTitles).toContain('第一章：第一处机枢渗水点')
    expect(visitedTitles).toContain('第一章：现场记录归档')
  })

  it('summarizes first-chapter irreversible outcomes before the transfer-station bridge', () => {
    const story = restoreInkStory(bundledStoryJson, undefined, '测试人')
    let view = collectStoryView(story)

    view = chooseDefaultNextStepUntil(story, view, '第一章：现场记录归档')
    const recap = view.paragraphs.join('\n')

    expect(recap).toContain('测试人的登记姓名、补办编号、通行条、熟客名单和未完成回执')
    expect(recap).toContain('配给章盒承认了现场应声的人')
    expect(recap).toContain('熟客名单缺页被林小满亲手补回去')
    expect(recap).toContain('第一处机枢渗水点被实名切断')
    expect(view.choices.find((choice) => choice.label === '沿社区服务中心出口往高架换乘站移动')).toMatchObject({
      surface: 'next_step',
      repeatable: false,
    })
  })

  it('keeps the frozen second-chapter compatibility bridge reachable without adding new chapter-2 content', () => {
    const story = restoreInkStory(bundledStoryJson)
    let view = collectStoryView(story)

    view = chooseDefaultNextStepUntil(story, view, '第一章：现场记录归档')
    view = chooseBundledChoice(story, view, '沿社区服务中心出口往高架换乘站移动')

    expect(view.title).toBe('第二章：换乘站台在移动')
    expect(view.location).toBe('高架换乘站外环换乘口')
    expect(view.notices).toEqual(
      expect.arrayContaining([
        'chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016',
        'anomaly=LC-IX-013,object=换乘箭头回环',
        'route_stability=未判定',
      ]),
    )
    expect(view.receipts).toContain('LC-IX-013=换乘箭头回环待核验')
    expect(view.choices.find((choice) => choice.label === '核对临时通行条上的换乘方向')).toMatchObject({
      surface: 'modal',
      repeatable: true,
    })
    expect(view.choices.find((choice) => choice.label === '让林小满清点同行的人')).toMatchObject({
      surface: 'modal',
      repeatable: true,
    })

    const arrowChoice = view.choices.find((choice) => choice.label === '跟着换乘箭头走一次')
    expect(arrowChoice).toMatchObject({
      surface: 'next_step',
      repeatable: false,
    })
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

  it('keeps untagged colon branch choices in the next-step surface', () => {
    const story = restoreInkStory(
      new Compiler(`
-> start

=== start ===
带冒号的叙事分支通常是一次性推进，不应该误判成可循环调查。
* [检查章盒：先看盖章机底座和章面有没有旧封条]
  -> DONE
`).Compile().ToJson() as string,
    )
    const view = collectStoryView(story)

    expect(view.choices[0]).toMatchObject({
      label: '检查章盒：先看盖章机底座和章面有没有旧封条',
      kind: 'advance',
      surface: 'next_step',
      repeatable: false,
    })
  })

  it('keeps untagged choices on decision-tagged scenes in the next-step surface', () => {
    const story = restoreInkStory(
      new Compiler(`
-> start

=== start ===
# notice:decision=必须推进
这些选项看起来像确认或检查，但它们属于决策节点。
* [确认回执，打开排水井下行路线]
  -> DONE
* [检查后拒绝签字]
  -> DONE
`).Compile().ToJson() as string,
    )
    const view = collectStoryView(story)

    expect(view.choices).toHaveLength(2)
    expect(view.choices.every((choice) => choice.kind === 'advance')).toBe(true)
    expect(view.choices.every((choice) => choice.surface === 'next_step')).toBe(true)
    expect(view.choices.every((choice) => choice.repeatable === false)).toBe(true)
  })

  it('keeps every reachable repeatable modal investigation in place after use', () => {
    const initialStory = restoreInkStory(bundledStoryJson)
    const initialView = collectStoryView(initialStory)
    const queue: Array<{ stateJson: string; view: InkStoryView }> = [
      {
        stateJson: initialStory.state.ToJson(),
        view: initialView,
      },
    ]
    const visitedScenes = new Set<string>()

    while (queue.length > 0) {
      const current = queue.shift()
      expect(current).toBeDefined()
      if (!current) break

      const nextChoices = current.view.choices.filter((choice) => choice.surface === 'next_step')
      const sceneKey = `${current.view.title}:${nextChoices.map((choice) => choice.label).join('|')}`
      if (visitedScenes.has(sceneKey)) continue
      visitedScenes.add(sceneKey)

      const modalChoices = current.view.choices.filter(
        (choice) => choice.surface === 'modal' && choice.repeatable,
      )
      for (const choice of modalChoices) {
        const branchStory = restoreInkStory(bundledStoryJson, current.stateJson)
        const branchView = chooseInkChoice(branchStory, choice.index).view

        expect(branchView.title, `Repeatable modal changed scene at ${current.view.title} / ${choice.label}`).toBe(
          current.view.title,
        )
        expect(
          branchView.choices.some((branchChoice) => branchChoice.label === choice.label),
          `Repeatable modal disappeared at ${current.view.title} / ${choice.label}`,
        ).toBe(true)
      }

      for (const choice of nextChoices) {
        const branchStory = restoreInkStory(bundledStoryJson, current.stateJson)
        const branchView = chooseInkChoice(branchStory, choice.index).view
        queue.push({
          stateJson: branchStory.state.ToJson(),
          view: branchView,
        })
      }

      expect(visitedScenes.size, 'Reachable repeatable-modal graph exceeded traversal budget').toBeLessThan(220)
    }

    expect(visitedScenes.size).toBeGreaterThan(10)
  }, 10000)

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

  it('normalizes whitespace inside effect tags', () => {
    const effect = parseEffectTags([
      'effect:resource= ration , +2 ',
      'effect:flag= test_flag , true ',
      'effect:irreversible= locked_choice , confirmed ',
      'exposure: +5 ',
      'exposure: floor = 2 ',
      'district: service_center = 贴封管控 ',
      'districtExposure: service_center = +3 ',
      'faction: queue_management = 交易 ',
      'companion: lin_xiaoman = 疲惫 , trust:+4 ',
      'receipt: 空格回执 ',
      'receipt: 空格回执 ',
    ])

    expect(effect.resources).toEqual({ ration: 2 })
    expect(effect.flags).toEqual({ test_flag: true })
    expect(effect.irreversibleFlags).toEqual({ locked_choice: 'confirmed' })
    expect(effect.exposureDelta).toBe(5)
    expect(effect.exposureFloor).toBe(2)
    expect(effect.districts).toEqual({ community_service_center: '贴封管控' })
    expect(effect.districtExposure).toEqual({ community_service_center: 3 })
    expect(effect.factions).toEqual({ queue_authority: '交易' })
    expect(effect.companions?.[0]).toMatchObject({
      id: 'lin_xiaoman',
      condition: '疲惫',
      trustDelta: 4,
    })
    expect(effect.receipts).toEqual(['空格回执'])
  })

  it('normalizes district status aliases used by story-facing tags', () => {
    const effect = parseEffectTags(['district:temporary_shelter=临时避难'])
    expect(effect.districts).toEqual({ temporary_shelter: '照常通行' })
  })
})

function chooseBundledChoice(story: Story, view: InkStoryView, label: string | RegExp): InkStoryView {
  const choice = view.choices.find((candidate) =>
    typeof label === 'string' ? candidate.label === label : label.test(candidate.label),
  )
  expect(choice, `Missing choice "${String(label)}" at ${view.title}`).toBeDefined()
  return chooseInkChoice(story, choice?.index ?? 0).view
}

function chooseDefaultNextStepUntil(story: Story, view: InkStoryView, title: string): InkStoryView {
  let currentView = view
  for (let step = 0; step < 80 && currentView.title !== title; step += 1) {
    const nextChoice = currentView.choices.find((choice) => choice.surface === 'next_step')
    expect(nextChoice, `Missing next-step choice at ${currentView.title}`).toBeDefined()
    currentView = chooseInkChoice(story, nextChoice?.index ?? 0).view
  }

  expect(currentView.title).toBe(title)
  return currentView
}

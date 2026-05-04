import { Compiler } from 'inkjs/full'
import type { Story } from 'inkjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import bundledStoryJson from '../../../public/stories/chapter-1.json?raw'
import {
  buildStoryAssetPath,
  chooseInkChoice,
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
    expect(view.choices.find((choice) => choice.label === '压住自己的号票，确认补办截止时间')).toMatchObject({
      group: 'document',
      surface: 'modal',
    })
    expect(view.choices.find((choice) => choice.label === '询问窗口是否能先登记“现场少人”')).toMatchObject({
      group: 'procedure',
      surface: 'next_step',
    })
    expect(view.choices.some((choice) => choice.label.includes('choice:'))).toBe(false)
  })

  it('preserves the opening premise and Lin Xiaoman motivation', () => {
    const story = restoreInkStory(bundledStoryJson)
    const openingView = collectStoryView(story)
    const openingText = openingView.paragraphs.join('\n')

    expect(openingText).toContain('周婶')
    expect(openingText).toContain('请在傍晚错峰复核前补齐临时通行条')
    expect(openingText).toContain('周婶那一行只剩楼栋')
    expect(openingText).toContain('只办自己的条，周婶会被写成从没来过')
    expect(openingText).toContain('熟客名单')
    expect(openingText).toContain('酸奶清点表')

    const openingAdvanceChoice = openingView.choices.find(
      (choice) => choice.label === '询问窗口是否能先登记“现场少人”',
    )
    expect(openingAdvanceChoice).toBeDefined()
    const zoneAView = chooseInkChoice(story, openingAdvanceChoice?.index ?? 0).view
    const zoneAText = zoneAView.paragraphs.join('\n')

    expect(zoneAText).toContain('没有给未核验姓名胸牌')
    expect(zoneAText).toContain('没有获得权力，只是被推到了责任最容易落下来的位置')
    expect(zoneAText).toContain('先碰哪一处，周婶、通行条和补办编号都会跟着动')
    expect(zoneAView.choices).toHaveLength(6)
    expect(zoneAView.choices.filter((choice) => choice.surface === 'modal' && choice.repeatable)).toHaveLength(3)
    expect(zoneAView.choices.filter((choice) => choice.surface === 'next_step' && !choice.repeatable)).toHaveLength(3)
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

  it('summarizes first-chapter irreversible outcomes before the transfer-station bridge', () => {
    const story = restoreInkStory(bundledStoryJson, undefined, '测试人')
    let view = collectStoryView(story)

    view = chooseDefaultNextStepUntil(story, view, '第一章：现场记录归档')
    const recap = view.paragraphs.join('\n')

    expect(recap).toContain('老王楼栋写成优先救援')
    expect(recap).toContain('下游承压居民自愿承担')
    expect(recap).toContain('熟客名单缺页被林小满亲手更正')
    expect(recap).toContain('第一处机枢渗水点被实名切断')
    expect(recap).toContain('暴露值有了下限')
    expect(view.choices.find((choice) => choice.label === '沿社区服务中心出口往高架换乘站移动')).toMatchObject({
      surface: 'next_step',
      repeatable: false,
    })
  })

  it('connects the bundled chapter to the second-chapter LC-IX-013 discovery entry', () => {
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

    const loopStateBeforeChoice = story.state.ToJson()
    const result = chooseInkChoice(story, arrowChoice?.index ?? 0)
    expect(result.view.title).toBe('第二章：换乘箭头回环')
    expect(result.view.receipts).toContain('LC-IX-013=换乘箭头回环待核验')
    expect(result.view.receipts).not.toContain('LC-IX-013 换乘箭头回环已记录')
    expect(result.effect.flags?.chapter_2_entry_reached).toBe(true)
    expect(result.view.choices.map((choice) => choice.label)).toEqual([
      '把队伍按名单停在栏杆内侧，重新清点到名字对上',
      '让前排原地等候，带林小满回到队尾认人',
      '站到导向牌下，喊停还在按箭头走的人',
    ])

    const transferArrowBranchExpectations = [
      {
        label: '把队伍按名单停在栏杆内侧，重新清点到名字对上',
        outcome: 'slowed_for_headcount',
        routeStability: 'slow_stable',
        receipt: 'LC-IX-013 换乘箭头回环已记录：停队清点',
        exposureDelta: 2,
      },
      {
        label: '让前排原地等候，带林小满回到队尾认人',
        outcome: 'tail_name_anchor',
        routeStability: 'fragile_tail_kept',
        receipt: 'LC-IX-013 换乘箭头回环已记录：队尾留名',
        exposureDelta: 4,
      },
      {
        label: '站到导向牌下，喊停还在按箭头走的人',
        outcome: 'public_warning',
        routeStability: 'public_contested',
        receipt: 'LC-IX-013 换乘箭头回环已记录：公开警示',
        exposureDelta: 8,
      },
    ]

    for (const expectation of transferArrowBranchExpectations) {
      const branchStory = restoreInkStory(bundledStoryJson, loopStateBeforeChoice)
      const loopView = chooseInkChoice(branchStory, arrowChoice?.index ?? 0).view
      const branchChoice = loopView.choices.find((choice) => choice.label === expectation.label)
      expect(branchChoice, `Missing LC-IX-013 branch "${expectation.label}"`).toBeDefined()
      const branchResult = chooseInkChoice(branchStory, branchChoice?.index ?? 0)

      expect(branchResult.view.title).toBe('第二章：换乘箭头处置回执')
      expect(branchResult.effect.flags?.ch2_transfer_arrow_choice).toBe(expectation.outcome)
      expect(branchResult.effect.flags?.ch2_route_stability).toBe(expectation.routeStability)
      expect(branchResult.effect.exposureDelta).toBe(expectation.exposureDelta)
      expect(branchResult.effect.receipts).toContain(expectation.receipt)
      expect(branchResult.view.choices.find((choice) => choice.label === '带着回环记录走向安检口旁的失物招领处')).toMatchObject({
        surface: 'next_step',
        repeatable: false,
      })
    }

    const lostAndFoundStory = restoreInkStory(bundledStoryJson, loopStateBeforeChoice)
    const lostAndFoundLoopView = chooseInkChoice(lostAndFoundStory, arrowChoice?.index ?? 0).view
    const lostAndFoundBranchChoice = lostAndFoundLoopView.choices.find(
      (choice) => choice.label === '把队伍按名单停在栏杆内侧，重新清点到名字对上',
    )
    const transferReceiptView = chooseInkChoice(lostAndFoundStory, lostAndFoundBranchChoice?.index ?? 0).view
    const lostAndFoundChoice = transferReceiptView.choices.find(
      (choice) => choice.label === '带着回环记录走向安检口旁的失物招领处',
    )
    const lostAndFoundResult = chooseInkChoice(lostAndFoundStory, lostAndFoundChoice?.index ?? 0)

    expect(lostAndFoundResult.view.title).toBe('第二章：安检口失物招领')
    expect(lostAndFoundResult.view.location).toBe('高架换乘站安检口内侧')
    expect(lostAndFoundResult.view.notices).toEqual(
      expect.arrayContaining([
        'chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016',
        'anomaly=LC-IX-014,object=安检口失物招领',
        'lost_found_state=待核验',
      ]),
    )
    expect(lostAndFoundResult.view.receipts).toContain('LC-IX-014=安检口失物招领待核验')
    expect(lostAndFoundResult.view.receipts).not.toContain('LC-IX-014 安检口失物招领已记录')
    expect(lostAndFoundResult.effect.flags?.ch2_lost_found_choice).toBeUndefined()
    expect(lostAndFoundResult.view.choices.find((choice) => choice.label === '核对钥匙串上的楼栋牌')).toMatchObject({
      surface: 'modal',
      repeatable: true,
    })
    expect(lostAndFoundResult.view.choices.find((choice) => choice.label === '翻看药袋外侧的姓名贴')).toMatchObject({
      surface: 'modal',
      repeatable: true,
    })
    expect(lostAndFoundResult.view.choices.find((choice) => choice.label === '检查通行条夹层里的旧照片')).toMatchObject({
      surface: 'modal',
      repeatable: true,
    })
    expect(lostAndFoundResult.view.choices.find((choice) => choice.label === '拿走药袋和钥匙，当场写下自己的补办编号')).toMatchObject({
      surface: 'next_step',
      repeatable: false,
    })
    expect(lostAndFoundResult.view.choices.find((choice) => choice.label === '不领取物品，请林小满和两名居民留下见证')).toMatchObject({
      surface: 'next_step',
      repeatable: false,
    })
    expect(lostAndFoundResult.view.choices.find((choice) => choice.label === '把失物招领登记单交给排队管理处盖收讫章')).toMatchObject({
      surface: 'next_step',
      repeatable: false,
    })

    const lostAndFoundStateBeforeChoice = lostAndFoundStory.state.ToJson()
    const lostAndFoundBranchExpectations = [
      {
        label: '拿走药袋和钥匙，当场写下自己的补办编号',
        outcome: 'claim_items',
        debt: 'claimed_by_protagonist',
        notice: 'lost_found_state=已领取承接',
        receipt: 'LC-IX-014 安检口失物招领已记录：领取承接',
        exposureDelta: 5,
      },
      {
        label: '不领取物品，请林小满和两名居民留下见证',
        outcome: 'witness_refusal',
        debt: 'witnessed_unclaimed',
        notice: 'lost_found_state=拒领留证',
        receipt: 'LC-IX-014 安检口失物招领已记录：拒领留证',
        exposureDelta: 2,
      },
      {
        label: '把失物招领登记单交给排队管理处盖收讫章',
        outcome: 'transfer_authority',
        debt: 'transferred_to_queue_management',
        notice: 'lost_found_state=移交管理',
        receipt: 'LC-IX-014 安检口失物招领已记录：移交收讫',
        exposureDelta: 3,
      },
    ]

    for (const expectation of lostAndFoundBranchExpectations) {
      const branchStory = restoreInkStory(bundledStoryJson, lostAndFoundStateBeforeChoice)
      const branchView = collectStoryView(branchStory)
      const branchChoice = branchView.choices.find((choice) => choice.label === expectation.label)
      expect(branchChoice, `Missing LC-IX-014 branch "${expectation.label}"`).toBeDefined()
      const branchResult = chooseInkChoice(branchStory, branchChoice?.index ?? 0)

      expect(branchResult.view.title).toBe('第二章：失物招领处置回执')
      expect(branchResult.view.notices).toContain(expectation.notice)
      expect(branchResult.effect.flags?.ch2_lost_found_choice).toBe(expectation.outcome)
      expect(branchResult.effect.flags?.ch2_lost_found_debt).toBe(expectation.debt)
      expect(branchResult.effect.exposureDelta).toBe(expectation.exposureDelta)
      expect(branchResult.effect.receipts).toContain(expectation.receipt)
      expect(branchResult.view.choices.find((choice) => choice.label === '带着广播里的同行提示离开安检口')).toMatchObject({
        surface: 'next_step',
        repeatable: false,
      })
    }

    const broadcastStory = restoreInkStory(bundledStoryJson, lostAndFoundStateBeforeChoice)
    const broadcastLostAndFoundView = collectStoryView(broadcastStory)
    const broadcastLostAndFoundChoice = broadcastLostAndFoundView.choices.find(
      (choice) => choice.label === '拿走药袋和钥匙，当场写下自己的补办编号',
    )
    expect(broadcastLostAndFoundChoice).toBeDefined()
    const broadcastBridgeView = chooseInkChoice(broadcastStory, broadcastLostAndFoundChoice?.index ?? 0).view
    const broadcastBridgeChoice = broadcastBridgeView.choices.find(
      (choice) => choice.label === '带着广播里的同行提示离开安检口',
    )
    expect(broadcastBridgeChoice).toBeDefined()
    const broadcastResult = chooseInkChoice(broadcastStory, broadcastBridgeChoice?.index ?? 0)

    expect(broadcastResult.view.title).toBe('第二章：站厅广播同一句')
    expect(broadcastResult.view.location).toBe('高架换乘站站厅柱列')
    expect(broadcastResult.view.notices).toEqual(
      expect.arrayContaining([
        'chapter=2,zone=A,range=LC-IX-013_to_LC-IX-016',
        'anomaly=LC-IX-016,object=站厅广播同一句',
        'broadcast_sentence_state=待核验',
      ]),
    )
    expect(broadcastResult.view.receipts).toContain('LC-IX-016=站厅广播同一句待核验')
    expect(broadcastResult.view.receipts).not.toContain('LC-IX-016 站厅广播同一句已记录：逐项核对')
    expect(broadcastResult.effect.flags?.ch2_station_broadcast_choice).toBeUndefined()
    expect(broadcastResult.view.choices.find((choice) => choice.label === '听完广播第二遍')).toMatchObject({
      surface: 'modal',
      repeatable: true,
    })
    expect(broadcastResult.view.choices.find((choice) => choice.label === '核对临时通行条上的同行栏')).toMatchObject({
      surface: 'modal',
      repeatable: true,
    })
    expect(broadcastResult.view.choices.find((choice) => choice.label === '停在站厅柱下，逐个核对谁和谁同行')).toMatchObject({
      surface: 'next_step',
      repeatable: false,
    })
    expect(broadcastResult.view.choices.find((choice) => choice.label === '赶上下一班车，只让每户报出一个同行名字')).toMatchObject({
      surface: 'next_step',
      repeatable: false,
    })
    expect(broadcastResult.view.choices.find((choice) => choice.label === '请林小满把同行关系写到熟客名单背面')).toMatchObject({
      surface: 'next_step',
      repeatable: false,
    })

    const broadcastStateBeforeChoice = broadcastStory.state.ToJson()
    const broadcastBranchExpectations = [
      {
        label: '停在站厅柱下，逐个核对谁和谁同行',
        outcome: 'full_headcount',
        companionState: 'manual_verified',
        notice: 'broadcast_sentence_state=逐项核对',
        receipt: 'LC-IX-016 站厅广播同一句已记录：逐项核对',
        exposureDelta: 2,
        trustDelta: 1,
      },
      {
        label: '赶上下一班车，只让每户报出一个同行名字',
        outcome: 'catch_safe_train',
        companionState: 'compressed_names',
        notice: 'broadcast_sentence_state=压缩登记',
        receipt: 'LC-IX-016 站厅广播同一句已记录：压缩登记',
        exposureDelta: 5,
        trustDelta: -1,
        moraleDelta: 2,
      },
      {
        label: '请林小满把同行关系写到熟客名单背面',
        outcome: 'list_anchor',
        companionState: 'lin_list_anchor',
        notice: 'broadcast_sentence_state=熟客名单锚定',
        receipt: 'LC-IX-016 站厅广播同一句已记录：名单锚定',
        exposureDelta: 3,
        trustDelta: 2,
      },
    ]

    for (const expectation of broadcastBranchExpectations) {
      const branchStory = restoreInkStory(bundledStoryJson, broadcastStateBeforeChoice)
      const branchView = collectStoryView(branchStory)
      const branchChoice = branchView.choices.find((choice) => choice.label === expectation.label)
      expect(branchChoice, `Missing LC-IX-016 branch "${expectation.label}"`).toBeDefined()
      const branchResult = chooseInkChoice(branchStory, branchChoice?.index ?? 0)

      expect(branchResult.view.title).toBe('第二章：站厅广播处置回执')
      expect(branchResult.view.notices).toContain(expectation.notice)
      expect(branchResult.effect.flags?.ch2_station_broadcast_choice).toBe(expectation.outcome)
      expect(branchResult.effect.flags?.ch2_broadcast_companion_state).toBe(expectation.companionState)
      expect(branchResult.effect.exposureDelta).toBe(expectation.exposureDelta)
      expect(branchResult.effect.districts?.transfer_station).toBe('错峰限行')
      expect(branchResult.effect.receipts).toContain(expectation.receipt)
      expect(branchResult.effect.companions).toContainEqual(
        expect.objectContaining({ id: 'lin_xiaoman', trustDelta: expectation.trustDelta }),
      )
      if (expectation.moraleDelta !== undefined) {
        expect(branchResult.effect.resources?.morale).toBe(expectation.moraleDelta)
      }
    }
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

  it('keeps late zone A scenes split into investigations and next steps', () => {
    const story = restoreInkStory(bundledStoryJson)
    let view = collectStoryView(story)

    view = chooseBundledChoice(story, view, '询问窗口是否能先登记“现场少人”')
    view = chooseBundledChoice(story, view, '接手桌面：清出一号窗口，把回执、申请和空白表分开')
    view = chooseBundledChoice(story, view, '按人在场排序：把已到场居民的申请压在最上面')
    view = chooseBundledChoice(story, view, '保护原件：请林小满留下名单，只允许窗口抄录备注')
    view = chooseBundledChoice(story, view, '合并登记：按章程建总表，把四项手续挂在同一补办编号下')

    expectSceneSurfaces(view, '配给登记：盖章机不等开窗', ['未来日期回执', '林小满', '床位表', '盖章机封条'])
    view = chooseBundledChoice(story, view, '完成盖章机、名单和床位核对，准备写配给登记更正页')
    view = chooseBundledChoice(story, view, '恢复在场名单：撕下错误页，按现场人数重填配给和床位')

    expectSceneSurfaces(view, '通行手续：复印件上的陌生照片', [
      '通行条复印件',
      '复印机缓存',
      '人工骑缝章',
      '林小满',
    ])
    view = chooseBundledChoice(story, view, '完成复印件、缓存和人工骑缝章核对，开始处理错峰名额')
    view = chooseBundledChoice(story, view, '只给病重老人复印一份，所有复印件必须原件同持')

    expectSceneSurfaces(view, '夜间安排：值班表空格', ['夜门痕迹', '轮班名单', '林小满', '居民口述'])
    view = chooseBundledChoice(story, view, '完成夜门、轮班名单和居民口述核对，讨论谁来写名字')
    view = chooseBundledChoice(story, view, /^写上自己的补办编号，先由.+顶第一班$/)

    expectSceneSurfaces(view, '物资清点：临期酸奶', ['清点表', '林小满', '人头数', '异常排序'])
  })

  it('keeps late zone B scenes split into investigations and next steps', () => {
    const story = restoreInkStory(bundledStoryJson)
    let view = collectStoryView(story)

    view = chooseDefaultNextStepUntil(story, view, 'LC-IX-006 档案柜第一排')
    expectSceneSurfaces(view, 'LC-IX-006 档案柜第一排', [
      '户籍袋',
      '脚踝水位',
      '通风管叫号声',
      '林小满',
    ])

    view = chooseBundledChoice(story, view, '档案上移：先把第一排能碰到的户籍袋搬上台阶。')
    view = chooseBundledChoice(story, view, '立刻回到大厅，先压住叫号屏。')
    view = chooseBundledChoice(story, view, '发放代排牌：让老人和儿童坐到窗口边，号码仍由原队列的人代持。')
    expectSceneSurfaces(view, 'LC-IX-007 广播、纸牌与湿档案', [
      '湿档案箱',
      '代排牌',
      '物业老王',
      '复印机',
    ])

    view = chooseBundledChoice(story, view, '让林小满按湿档案核对刚刚被叫到的号码。')
    expectSceneSurfaces(view, 'LC-IX-008 物业群第 404 条消息', [
      '第404条消息',
      '打印机',
      '物业老王',
      '广播',
    ])
  })

  it('keeps zone C modal investigations sticky after use', () => {
    const story = restoreInkStory(bundledStoryJson)
    let view = collectStoryView(story)

    view = chooseDefaultNextStepUntil(story, view, '第一章：积水档案室')
    view = expectStickyModalChoice(story, view, '先把上一片区留下的通行条和回执装进防水袋')
    expectSceneSurfaces(view, '第一章：积水档案室', ['防水袋', '林小满', '水线', '消防门'])

    view = chooseBundledChoice(story, view, '带着已保护的证据压低身体，进入积水档案室')
    view = expectStickyModalChoice(story, view, /^逐项核对维修单抬头和.+自己的补办编号$/)
    expectSceneSurfaces(view, '第一章：消防门维修单', ['维修单', '责任说明', '林小满', '档案柜'])

    view = chooseBundledChoice(story, view, '拿起笔，进入消防门维修单签字环节')
    view = chooseBundledChoice(story, view, '补齐老王楼栋那半枚章，优先打开消防门')
    view = expectStickyModalChoice(story, view, '先不动井盖，核对回执编号')
    expectSceneSurfaces(view, '第一章：排水井回执', ['回执编号', '消防门维修单', '林小满', '井盖刻痕'])
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

function expectStickyModalChoice(story: Story, view: InkStoryView, label: string | RegExp): InkStoryView {
  const selectedChoice = view.choices.find((candidate) =>
    typeof label === 'string' ? candidate.label === label : label.test(candidate.label),
  )
  expect(selectedChoice, `Missing sticky choice "${String(label)}" at ${view.title}`).toBeDefined()
  expect(selectedChoice?.surface).toBe('modal')
  expect(selectedChoice?.repeatable).toBe(true)

  const nextView = chooseInkChoice(story, selectedChoice?.index ?? 0).view
  expect(
    nextView.choices.some((candidate) =>
      typeof label === 'string' ? candidate.label === label : label.test(candidate.label),
    ),
    `Sticky choice "${String(label)}" disappeared after use at ${view.title}`,
  ).toBe(true)
  return nextView
}

function expectSceneSurfaces(view: InkStoryView, title: string, modalTargetLabels: string[]): void {
  expect(view.title).toBe(title)
  expect(view.choices.filter((choice) => choice.surface === 'next_step').length).toBeGreaterThan(0)

  for (const label of modalTargetLabels) {
    expect(
      view.choices.some(
        (choice) => choice.surface === 'modal' && choice.repeatable && choice.targetLabel === label,
      ),
      `Missing modal investigation "${label}" at ${title}`,
    ).toBe(true)
  }
}

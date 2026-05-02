import { Compiler } from 'inkjs/full'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
第一段正文。
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
    expect(view.choices[0].label).toBe('办理手续')
  })

  it('advances a choice and parses effect tags', () => {
    const story = restoreInkStory(storyJson)
    collectStoryView(story)
    const { view, effect } = chooseInkChoice(story, 0)

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

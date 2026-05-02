import { Story } from 'inkjs'
import type { ChoiceEffect } from '../simulation/systems/choices'
import type { CompanionCondition, DistrictStatus, FactionRelation, WorldFlagValue } from '../simulation/state'

export interface InkChoiceView {
  id: string
  index: number
  label: string
  kind: 'advance' | 'inspect'
}

export interface InkStoryView {
  title: string
  location: string
  paragraphs: string[]
  choices: InkChoiceView[]
  notices: string[]
  receipts: string[]
  tags: string[]
  isComplete: boolean
}

export interface InkRuntimeSnapshot {
  storyStateJson: string
  view: InkStoryView
}

export interface InkAdvanceResult {
  view: InkStoryView
  effect: ChoiceEffect
}

const DEFAULT_VIEW: InkStoryView = {
  title: '补办窗口不会等人',
  location: '临时避难点',
  paragraphs: [],
  choices: [],
  notices: [],
  receipts: [],
  tags: [],
  isComplete: false,
}

export async function loadInkStory(path = '/stories/chapter-1.json', protagonistName?: string): Promise<Story> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Unable to load Ink story: ${response.status} ${response.statusText}`)
  }

  const storyJson = (await response.text()).replace(/^\uFEFF/, '')
  const story = new Story(storyJson)
  applyProtagonistName(story, protagonistName)
  return story
}

export function restoreInkStory(storyJson: string, stateJson?: string, protagonistName?: string): Story {
  const story = new Story(storyJson.replace(/^\uFEFF/, ''))
  applyProtagonistName(story, protagonistName)
  if (stateJson) {
    story.state.LoadJson(stateJson)
  }
  return story
}

export function applyProtagonistName(story: Story, protagonistName?: string): void {
  if (!protagonistName) return
  story.variablesState.$('protagonist_name', protagonistName)
}

export function collectStoryView(story: Story): InkStoryView {
  const paragraphs: string[] = []
  const tags: string[] = []

  while (story.canContinue) {
    const line = story.Continue()?.trim()
    if (line) paragraphs.push(line)
    tags.push(...(story.state.currentTags ?? []))
  }

  return buildView(paragraphs, tags, story.currentChoices.map((choice, index) => ({
    id: String(index),
    index,
    label: choice.text,
    kind: inferChoiceKind(choice.text),
  })))
}

export function chooseInkChoice(story: Story, index: number): InkAdvanceResult {
  story.ChooseChoiceIndex(index)
  const view = collectStoryView(story)
  return {
    view,
    effect: parseEffectTags(view.tags),
  }
}

export function snapshotInkStory(story: Story, view: InkStoryView): InkRuntimeSnapshot {
  return {
    storyStateJson: story.state.ToJson(),
    view,
  }
}

export function parseEffectTags(tags: string[]): ChoiceEffect {
  const effect: ChoiceEffect = {
    flags: {},
    irreversibleFlags: {},
    districts: {},
    factions: {},
    companions: [],
    receipts: [],
  }

  for (const rawTag of tags) {
    const tag = rawTag.trim()
    if (tag.startsWith('effect:time=')) {
      effect.timeMinutes = parseNumber(tag.slice('effect:time='.length), 0)
      continue
    }

    if (tag.startsWith('effect:resource=')) {
      const [key, value] = tag.slice('effect:resource='.length).split(',')
      if (key && value) {
        effect.resources = {
          ...effect.resources,
          [key]: parseNumber(value, 0),
        }
      }
      continue
    }

    if (tag.startsWith('effect:flag=')) {
      const [key, value] = tag.slice('effect:flag='.length).split(',')
      if (key) effect.flags = { ...effect.flags, [key]: parseFlagValue(value) }
      continue
    }

    if (tag.startsWith('effect:irreversible=')) {
      const [key, value] = tag.slice('effect:irreversible='.length).split(',')
      if (key) effect.irreversibleFlags = { ...effect.irreversibleFlags, [key]: parseFlagValue(value) }
      continue
    }

    if (tag.startsWith('exposure:')) {
      const value = tag.slice('exposure:'.length)
      if (value.startsWith('floor=')) {
        effect.exposureFloor = parseNumber(value.slice('floor='.length), 0)
      } else {
        effect.exposureDelta = (effect.exposureDelta ?? 0) + parseNumber(value, 0)
      }
      continue
    }

    if (tag.startsWith('district:')) {
      const [districtId, status] = tag.slice('district:'.length).split('=')
      const normalizedStatus = normalizeDistrictStatus(status)
      if (districtId && normalizedStatus) {
        effect.districts = { ...effect.districts, [normalizeDistrictId(districtId)]: normalizedStatus }
      }
      continue
    }

    if (tag.startsWith('districtExposure:')) {
      const [districtId, value] = tag.slice('districtExposure:'.length).split('=')
      if (districtId && value) {
        effect.districtExposure = {
          ...effect.districtExposure,
          [normalizeDistrictId(districtId)]: parseNumber(value, 0),
        }
      }
      continue
    }

    if (tag.startsWith('faction:')) {
      const [factionId, relation] = tag.slice('faction:'.length).split('=')
      if (factionId && isFactionRelation(relation)) {
        effect.factions = { ...effect.factions, [normalizeFactionId(factionId)]: relation }
      }
      continue
    }

    if (tag.startsWith('companion:')) {
      const [id, payload] = tag.slice('companion:'.length).split('=')
      if (!id || !payload) continue

      const parts = payload.split(',')
      const condition = parts.find((part) => !part.startsWith('trust:')) as CompanionCondition | undefined
      const trust = parts.find((part) => part.startsWith('trust:'))
      effect.companions = [
        ...(effect.companions ?? []),
        {
          id,
          condition,
          trustDelta: trust ? parseNumber(trust.slice('trust:'.length), 0) : undefined,
        },
      ]
    }

    if (tag.startsWith('receipt:')) {
      const receipt = tag.slice('receipt:'.length)
      effect.receipts = Array.from(new Set([...(effect.receipts ?? []), receipt]))
    }
  }

  return effect
}

const DISTRICT_ALIASES: Record<string, string> = {
  service_center: 'community_service_center',
}

const STATUS_ALIASES: Record<string, DistrictStatus> = {
  临时避难: '照常通行',
  正常通行: '照常通行',
}

const FACTION_ALIASES: Record<string, string> = {
  queue_management: 'queue_authority',
}

const DISTRICT_STATUSES: DistrictStatus[] = [
  '照常通行',
  '错峰限行',
  '积水待排',
  '临时停电',
  '贴封管控',
  '转移安置',
  '停供断线',
  '社区庇护',
  '下沉失序',
]

const FACTION_RELATIONS: FactionRelation[] = ['敌对', '警惕', '交易', '信任', '绑定']

function buildView(paragraphs: string[], tags: string[], choices: InkChoiceView[]): InkStoryView {
  const screenTags = parseScreenTags(tags)
  return {
    ...DEFAULT_VIEW,
    ...screenTags,
    paragraphs,
    choices,
    notices: Array.from(
      new Set(tags.filter((tag) => tag.startsWith('notice:')).map((tag) => tag.slice('notice:'.length))),
    ),
    receipts: Array.from(
      new Set(tags.filter((tag) => tag.startsWith('receipt:')).map((tag) => tag.slice('receipt:'.length))),
    ),
    tags,
    isComplete: choices.length === 0,
  }
}

function parseScreenTags(tags: string[]): Partial<InkStoryView> {
  return tags.reduce<Partial<InkStoryView>>((view, rawTag) => {
    const tag = rawTag.trim()
    if (tag.startsWith('screen:title=')) {
      return { ...view, title: tag.slice('screen:title='.length) }
    }

    if (tag.startsWith('screen:location=')) {
      return { ...view, location: tag.slice('screen:location='.length) }
    }

    return view
  }, {})
}

function inferChoiceKind(label: string): InkChoiceView['kind'] {
  return /^(和|听|查看|观察|闲聊|旁听|查阅)/.test(label.trim()) ? 'inspect' : 'advance'
}

function parseFlagValue(value?: string): WorldFlagValue {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === undefined) return true
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? value : numberValue
}

function parseNumber(value: string, fallback: number): number {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

function normalizeDistrictId(id: string): string {
  return DISTRICT_ALIASES[id] ?? id
}

function normalizeFactionId(id: string): string {
  return FACTION_ALIASES[id] ?? id
}

function isDistrictStatus(value: string | undefined): value is DistrictStatus {
  return DISTRICT_STATUSES.includes(value as DistrictStatus)
}

function isFactionRelation(value: string | undefined): value is FactionRelation {
  return FACTION_RELATIONS.includes(value as FactionRelation)
}

function normalizeDistrictStatus(value: string | undefined): DistrictStatus | undefined {
  if (!value) return undefined
  return STATUS_ALIASES[value] ?? (isDistrictStatus(value) ? value : undefined)
}

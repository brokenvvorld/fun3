import { Story } from 'inkjs'
import type { ChoiceEffect } from '../simulation/systems/choices'
import type { CompanionCondition, DistrictStatus, FactionRelation, WorldFlagValue } from '../simulation/state'

export interface InkChoiceView {
  id: string
  index: number
  label: string
  kind: 'advance' | 'inspect'
  group: ChoiceGroup
  targetId: string
  targetLabel: string
  mode: ChoiceMode
  surface: ChoiceSurface
  repeatable: boolean
}

export type ChoiceGroup = 'person' | 'machine' | 'document' | 'place' | 'procedure' | 'decision'
export type ChoiceMode = 'inspect' | 'talk' | 'operate' | 'compare' | 'decide' | 'advance'
export type ChoiceSurface = 'object_panel' | 'modal' | 'next_step'

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

export function buildStoryAssetPath(basePath = import.meta.env.BASE_URL): string {
  const normalizedBasePath = basePath === '' || basePath.endsWith('/') ? basePath : `${basePath}/`
  return `${normalizedBasePath}stories/chapter-1.json`
}

export const DEFAULT_STORY_PATH = buildStoryAssetPath()

export async function loadInkStory(path = DEFAULT_STORY_PATH, protagonistName?: string): Promise<Story> {
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

  const choiceMetadata = parseChoiceMetadata(tags)
  const forceAdvanceChoices = tags.some((tag) => tag.trim().startsWith('notice:decision'))

  return buildView(
    paragraphs,
    tags,
    story.currentChoices.map((choice, index) =>
      buildChoiceView(choice.text, index, choiceMetadata[index], forceAdvanceChoices),
    ),
  )
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
    if (tag.startsWith('effect:resource=')) {
      const [key, value] = splitTrimmed(tag.slice('effect:resource='.length), ',')
      if (key && value) {
        effect.resources = {
          ...effect.resources,
          [key]: parseNumber(value, 0),
        }
      }
      continue
    }

    if (tag.startsWith('effect:flag=')) {
      const [key, value] = splitTrimmed(tag.slice('effect:flag='.length), ',')
      if (key) effect.flags = { ...effect.flags, [key]: parseFlagValue(value) }
      continue
    }

    if (tag.startsWith('effect:irreversible=')) {
      const [key, value] = splitTrimmed(tag.slice('effect:irreversible='.length), ',')
      if (key) effect.irreversibleFlags = { ...effect.irreversibleFlags, [key]: parseFlagValue(value) }
      continue
    }

    if (tag.startsWith('exposure:')) {
      const value = tag.slice('exposure:'.length).trim()
      const [exposureKey, exposureValue] = splitTrimmed(value, '=')
      if (exposureKey === 'floor' && exposureValue) {
        effect.exposureFloor = parseNumber(exposureValue, 0)
      } else {
        effect.exposureDelta = (effect.exposureDelta ?? 0) + parseNumber(value, 0)
      }
      continue
    }

    if (tag.startsWith('district:')) {
      const [districtId, status] = splitTrimmed(tag.slice('district:'.length), '=')
      const normalizedStatus = normalizeDistrictStatus(status)
      if (districtId && normalizedStatus) {
        effect.districts = { ...effect.districts, [normalizeDistrictId(districtId)]: normalizedStatus }
      }
      continue
    }

    if (tag.startsWith('districtExposure:')) {
      const [districtId, value] = splitTrimmed(tag.slice('districtExposure:'.length), '=')
      if (districtId && value) {
        effect.districtExposure = {
          ...effect.districtExposure,
          [normalizeDistrictId(districtId)]: parseNumber(value, 0),
        }
      }
      continue
    }

    if (tag.startsWith('faction:')) {
      const [factionId, relation] = splitTrimmed(tag.slice('faction:'.length), '=')
      if (factionId && isFactionRelation(relation)) {
        effect.factions = { ...effect.factions, [normalizeFactionId(factionId)]: relation }
      }
      continue
    }

    if (tag.startsWith('companion:')) {
      const [id, payload] = splitTrimmed(tag.slice('companion:'.length), '=')
      if (!id || !payload) continue

      const parts = payload.split(',').map((part) => part.trim())
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
      const receipt = tag.slice('receipt:'.length).trim()
      if (receipt) effect.receipts = Array.from(new Set([...(effect.receipts ?? []), receipt]))
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
  const normalizedTags = tags.map((tag) => tag.trim())
  return {
    ...DEFAULT_VIEW,
    ...screenTags,
    paragraphs,
    choices,
    notices: Array.from(
      new Set(
        normalizedTags.filter((tag) => tag.startsWith('notice:')).map((tag) => tag.slice('notice:'.length)),
      ),
    ),
    receipts: Array.from(
      new Set(
        normalizedTags.filter((tag) => tag.startsWith('receipt:')).map((tag) => tag.slice('receipt:'.length)),
      ),
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
  const trimmedLabel = label.trim()
  if (trimmedLabel.includes('：')) return 'advance'

  return /^(和|听|查看|观察|闲聊|旁听|查阅|检查|询问|确认|核对)/.test(trimmedLabel)
    ? 'inspect'
    : 'advance'
}

type ChoiceMetadata = Partial<
  Pick<InkChoiceView, 'group' | 'targetId' | 'targetLabel' | 'mode' | 'surface' | 'repeatable'>
>

function buildChoiceView(
  label: string,
  index: number,
  metadata: ChoiceMetadata = {},
  forceAdvance = false,
): InkChoiceView {
  const fallbackKind = forceAdvance ? 'advance' : inferChoiceKind(label)
  const kind = metadata.surface === 'next_step' || metadata.mode === 'advance' ? 'advance' : fallbackKind
  const group = metadata.group ?? inferChoiceGroup(label, kind)
  const targetId = metadata.targetId ?? inferTargetId(label, group)
  const targetLabel = metadata.targetLabel ?? formatTargetLabel(targetId, group)
  const mode = metadata.mode ?? (kind === 'advance' ? 'advance' : inferChoiceMode(label))
  const surface = metadata.surface ?? (kind === 'advance' ? 'next_step' : 'modal')

  return {
    id: String(index),
    index,
    label,
    kind,
    group,
    targetId,
    targetLabel,
    mode,
    surface,
    repeatable: metadata.repeatable ?? kind === 'inspect',
  }
}

function parseChoiceMetadata(tags: string[]): Record<number, ChoiceMetadata> {
  const metadata: Record<number, ChoiceMetadata> = {}

  for (const rawTag of tags) {
    const tag = rawTag.trim()
    const match = /^choice:(\d+):([a-zA-Z_]+)\s*=\s*(.+)$/.exec(tag)
    if (!match) continue

    const [, indexValue, rawKey, rawValue] = match
    const index = Number(indexValue)
    if (Number.isNaN(index)) continue

    const key = rawKey.toLowerCase()
    const value = rawValue.trim()
    const normalizedValue = value.toLowerCase()
    const choice = metadata[index] ?? {}
    if (key === 'group' && isChoiceGroup(normalizedValue)) choice.group = normalizedValue
    if (key === 'target') choice.targetId = value
    if (key === 'label') choice.targetLabel = value
    if (key === 'mode' && isChoiceMode(normalizedValue)) choice.mode = normalizedValue
    if (key === 'surface' && isChoiceSurface(normalizedValue)) choice.surface = normalizedValue
    if (key === 'repeatable') choice.repeatable = normalizedValue === 'true'
    metadata[index] = choice
  }

  return metadata
}

function inferChoiceGroup(label: string, kind: InkChoiceView['kind']): ChoiceGroup {
  if (kind === 'advance') return 'decision'
  if (/林小满|志愿者|老王|老人|孩子|居民|队伍|人群/.test(label)) return 'person'
  if (/机|屏|窗口|章盒|复印|打印|广播|维护盒/.test(label)) return 'machine'
  if (/名单|回执|号票|材料|档案|表|单|证明|告示|消息|纸/.test(label)) return 'document'
  if (/门|水线|楼梯|井|通道|大厅|桌面|墙|路线/.test(label)) return 'place'
  return 'procedure'
}

function inferChoiceMode(label: string): ChoiceMode {
  if (/和|询问|请|让|问/.test(label)) return 'talk'
  if (/检查|查看|观察|确认|核对|听|读/.test(label)) return 'inspect'
  if (/对照|交叉|比对|关联/.test(label)) return 'compare'
  if (/按|递|封|贴|写|放|切断|打开|接住|拿/.test(label)) return 'operate'
  return 'inspect'
}

function inferTargetId(label: string, group: ChoiceGroup): string {
  if (/林小满/.test(label)) return 'lin_xiaoman'
  if (/取号机|号票/.test(label)) return 'ticket_machine'
  if (/盖章机|章盒/.test(label)) return 'stamp_machine'
  if (/熟客名单|名单/.test(label)) return 'customer_list'
  if (/队伍|人群|居民|老人|孩子|志愿者/.test(label)) return 'crowd'
  if (/回执|材料|档案|证明|消息|维修单|表/.test(label)) return 'documents'
  if (/水线|排水井|井|积水/.test(label)) return 'waterline'
  if (/消防门|门/.test(label)) return 'fire_door'
  if (/客服|窗口|办理|手续/.test(label)) return 'procedure'
  return group
}

function formatTargetLabel(targetId: string, group: ChoiceGroup): string {
  const labels: Record<string, string> = {
    lin_xiaoman: '林小满',
    ticket_machine: '取号机',
    stamp_machine: '盖章机',
    customer_list: '熟客名单',
    crowd: '队伍',
    documents: '文件',
    waterline: '水线',
    fire_door: '消防门',
    procedure: '手续',
  }
  const groupLabels: Record<ChoiceGroup, string> = {
    person: '人物',
    machine: '设备',
    document: '文件',
    place: '地点',
    procedure: '手续',
    decision: '下一步',
  }
  return labels[targetId] ?? groupLabels[group]
}

function isChoiceGroup(value: string): value is ChoiceGroup {
  return ['person', 'machine', 'document', 'place', 'procedure', 'decision'].includes(value)
}

function isChoiceMode(value: string): value is ChoiceMode {
  return ['inspect', 'talk', 'operate', 'compare', 'decide', 'advance'].includes(value)
}

function isChoiceSurface(value: string): value is ChoiceSurface {
  return ['object_panel', 'modal', 'next_step'].includes(value)
}

function parseFlagValue(value?: string): WorldFlagValue {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === undefined) return true
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? value : numberValue
}

function parseNumber(value: string, fallback: number): number {
  const parsed = Number(value.trim())
  return Number.isNaN(parsed) ? fallback : parsed
}

function splitTrimmed(value: string, separator: ',' | '='): [string | undefined, string | undefined] {
  const [head, ...tail] = value.split(separator)
  return [head?.trim(), tail.join(separator).trim()]
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

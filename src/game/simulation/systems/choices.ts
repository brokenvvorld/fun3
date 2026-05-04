import {
  clampExposure,
  type CompanionCondition,
  type DistrictStatus,
  type EndingLockStatus,
  type FactionRelation,
  type RegistryNameStatus,
  type WorldFlagValue,
  type WorldState,
} from '../state'

export interface CompanionEffect {
  id: string
  condition?: CompanionCondition
  trustDelta?: number
  note?: string
}

export interface ChoiceEffect {
  protagonist?: {
    registryNameStatus?: RegistryNameStatus
    permitStatus?: string
    registryNumber?: string
  }
  resources?: Partial<Record<keyof WorldState['resources'], number>>
  flags?: Record<string, WorldFlagValue>
  irreversibleFlags?: Record<string, WorldFlagValue>
  exposureDelta?: number
  exposureFloor?: number
  districtExposure?: Record<string, number>
  districts?: Record<string, DistrictStatus>
  districtNotes?: Record<string, string>
  factions?: Record<string, FactionRelation>
  factionNotes?: Record<string, string>
  companions?: CompanionEffect[]
  quests?: {
    activate?: string[]
    complete?: string[]
    fail?: string[]
  }
  endingLocks?: Record<
    string,
    {
      status?: EndingLockStatus
      note?: string
    }
  >
  receipts?: string[]
}

export function applyChoiceEffect(state: WorldState, effect: ChoiceEffect): WorldState {
  const protagonist = {
    ...state.protagonist,
    registryNameStatus: effect.protagonist?.registryNameStatus ?? state.protagonist.registryNameStatus,
    permitStatus: effect.protagonist?.permitStatus ?? state.protagonist.permitStatus,
    registryNumber: effect.protagonist?.registryNumber ?? state.protagonist.registryNumber,
  }

  const resources = { ...state.resources }

  for (const [key, delta] of Object.entries(effect.resources ?? {})) {
    const resourceKey = key as keyof WorldState['resources']
    resources[resourceKey] = Math.max(0, resources[resourceKey] + (delta ?? 0))
  }

  const exposureFloor = Math.max(state.anomalyExposure.floor, effect.exposureFloor ?? 0)
  const globalExposure = clampExposure(
    Math.max(exposureFloor, state.anomalyExposure.global + (effect.exposureDelta ?? 0)),
  )
  const districtExposure = { ...state.anomalyExposure.districts }
  for (const [districtId, delta] of Object.entries(effect.districtExposure ?? {})) {
    districtExposure[districtId] = clampExposure((districtExposure[districtId] ?? 0) + delta)
  }

  const districts = { ...state.districts }
  for (const [districtId, status] of Object.entries(effect.districts ?? {})) {
    const existing = districts[districtId]
    districts[districtId] = {
      id: districtId,
      name: existing?.name ?? districtId,
      status,
      notes: existing?.notes ?? [],
    }
  }
  for (const [districtId, note] of Object.entries(effect.districtNotes ?? {})) {
    const existing = districts[districtId]
    districts[districtId] = {
      id: districtId,
      name: existing?.name ?? districtId,
      status: existing?.status ?? '照常通行',
      notes: prependNote(existing?.notes ?? [], note),
    }
  }

  const factions = { ...state.factions }
  for (const [factionId, relation] of Object.entries(effect.factions ?? {})) {
    const existing = factions[factionId]
    factions[factionId] = {
      id: factionId,
      name: existing?.name ?? factionId,
      relation,
      notes: existing?.notes ?? [],
    }
  }
  for (const [factionId, note] of Object.entries(effect.factionNotes ?? {})) {
    const existing = factions[factionId]
    factions[factionId] = {
      id: factionId,
      name: existing?.name ?? factionId,
      relation: existing?.relation ?? '警惕',
      notes: prependNote(existing?.notes ?? [], note),
    }
  }

  const companions = { ...state.companions }
  for (const companionEffect of effect.companions ?? []) {
    const existing = companions[companionEffect.id]
    if (!existing) continue

    companions[companionEffect.id] = {
      ...existing,
      condition: companionEffect.condition ?? existing.condition,
      trust: Math.max(0, Math.min(100, existing.trust + (companionEffect.trustDelta ?? 0))),
      notes: companionEffect.note ? prependNote(existing.notes, companionEffect.note) : existing.notes,
    }
  }

  const quests = applyQuestEffect(state.quests, effect.quests)
  const endingLocks = { ...state.endingLocks }
  for (const [endingId, endingEffect] of Object.entries(effect.endingLocks ?? {})) {
    const existing = endingLocks[endingId]
    if (!existing) continue

    endingLocks[endingId] = {
      ...existing,
      status: endingEffect.status ?? existing.status,
      notes: endingEffect.note ? prependNote(existing.notes, endingEffect.note) : existing.notes,
    }
  }

  return {
    ...state,
    protagonist,
    resources,
    anomalyExposure: {
      floor: exposureFloor,
      global: globalExposure,
      districts: districtExposure,
    },
    districts,
    factions,
    companions,
    quests,
    endingLocks,
    flags: {
      ...state.flags,
      ...effect.flags,
    },
    irreversibleFlags: {
      ...state.irreversibleFlags,
      ...effect.irreversibleFlags,
    },
  }
}

function applyQuestEffect(
  quests: WorldState['quests'],
  effect: ChoiceEffect['quests'] | undefined,
): WorldState['quests'] {
  if (!effect) return quests

  let active = quests.active
  let completed = quests.completed
  let failed = quests.failed

  for (const questId of effect.activate ?? []) {
    active = appendUnique(active, questId)
  }
  for (const questId of effect.complete ?? []) {
    completed = appendUnique(completed, questId)
    active = active.filter((id) => id !== questId)
    failed = failed.filter((id) => id !== questId)
  }
  for (const questId of effect.fail ?? []) {
    failed = appendUnique(failed, questId)
    active = active.filter((id) => id !== questId)
    completed = completed.filter((id) => id !== questId)
  }

  return { active, completed, failed }
}

function appendUnique(values: string[], nextValue: string) {
  return values.includes(nextValue) ? values : [...values, nextValue]
}

function prependNote(notes: string[], note: string) {
  return [note, ...notes.filter((existing) => existing !== note)].slice(0, 8)
}

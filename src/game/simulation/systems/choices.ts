import {
  clampExposure,
  type CompanionCondition,
  type DistrictStatus,
  type FactionRelation,
  type WorldFlagValue,
  type WorldState,
} from '../state'
import { spendTime } from './time'

export interface CompanionEffect {
  id: string
  condition?: CompanionCondition
  trustDelta?: number
  note?: string
}

export interface ChoiceEffect {
  timeMinutes?: number
  resources?: Partial<Record<keyof WorldState['resources'], number>>
  flags?: Record<string, WorldFlagValue>
  irreversibleFlags?: Record<string, WorldFlagValue>
  exposureDelta?: number
  exposureFloor?: number
  districtExposure?: Record<string, number>
  districts?: Record<string, DistrictStatus>
  factions?: Record<string, FactionRelation>
  companions?: CompanionEffect[]
  receipts?: string[]
}

export function applyChoiceEffect(state: WorldState, effect: ChoiceEffect): WorldState {
  const timedState = spendTime(state, effect.timeMinutes ?? 0)
  const resources = { ...timedState.resources }

  for (const [key, delta] of Object.entries(effect.resources ?? {})) {
    const resourceKey = key as keyof WorldState['resources']
    resources[resourceKey] = Math.max(0, resources[resourceKey] + (delta ?? 0))
  }

  const exposureFloor = Math.max(timedState.anomalyExposure.floor, effect.exposureFloor ?? 0)
  const globalExposure = clampExposure(
    Math.max(exposureFloor, timedState.anomalyExposure.global + (effect.exposureDelta ?? 0)),
  )
  const districtExposure = { ...timedState.anomalyExposure.districts }
  for (const [districtId, delta] of Object.entries(effect.districtExposure ?? {})) {
    districtExposure[districtId] = clampExposure((districtExposure[districtId] ?? 0) + delta)
  }

  const districts = { ...timedState.districts }
  for (const [districtId, status] of Object.entries(effect.districts ?? {})) {
    const existing = districts[districtId]
    districts[districtId] = {
      id: districtId,
      name: existing?.name ?? districtId,
      status,
      notes: existing?.notes ?? [],
    }
  }

  const factions = { ...timedState.factions }
  for (const [factionId, relation] of Object.entries(effect.factions ?? {})) {
    const existing = factions[factionId]
    factions[factionId] = {
      id: factionId,
      name: existing?.name ?? factionId,
      relation,
      notes: existing?.notes ?? [],
    }
  }

  const companions = { ...timedState.companions }
  for (const companionEffect of effect.companions ?? []) {
    const existing = companions[companionEffect.id]
    if (!existing) continue

    companions[companionEffect.id] = {
      ...existing,
      condition: companionEffect.condition ?? existing.condition,
      trust: Math.max(0, Math.min(100, existing.trust + (companionEffect.trustDelta ?? 0))),
      notes: companionEffect.note ? [companionEffect.note, ...existing.notes].slice(0, 8) : existing.notes,
    }
  }

  return {
    ...timedState,
    resources,
    anomalyExposure: {
      floor: exposureFloor,
      global: globalExposure,
      districts: districtExposure,
    },
    districts,
    factions,
    companions,
    flags: {
      ...timedState.flags,
      ...effect.flags,
    },
    irreversibleFlags: {
      ...timedState.irreversibleFlags,
      ...effect.irreversibleFlags,
    },
  }
}

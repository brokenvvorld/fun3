import { describe, expect, it } from 'vitest'
import { initialWorldState } from '../state'
import { applyChoiceEffect } from './choices'

describe('choice effects', () => {
  it('applies time, resource, and flag consequences', () => {
    const next = applyChoiceEffect(initialWorldState, {
      timeMinutes: 45,
      resources: { food: 2, water: -1 },
      flags: { civicEngineKnown: true },
    })

    expect(next.clock).toEqual({ day: 1, hour: 8, minute: 15 })
    expect(next.resources.food).toBe(6)
    expect(next.resources.water).toBe(4)
    expect(next.flags.civicEngineKnown).toBe(true)
  })

  it('keeps irreversible flags when later choices omit them', () => {
    const first = applyChoiceEffect(initialWorldState, {
      irreversibleFlags: { flag_fire_door_abandoned: true },
    })
    const second = applyChoiceEffect(first, {
      flags: { ch1_fire_door_status: 'mitigated' },
    })

    expect(second.irreversibleFlags.flag_fire_door_abandoned).toBe(true)
    expect(second.flags.ch1_fire_door_status).toBe('mitigated')
  })

  it('clamps exposure and updates factions, districts, and companion state', () => {
    const next = applyChoiceEffect(initialWorldState, {
      exposureDelta: 200,
      exposureFloor: 35,
      districts: { temporary_shelter: '社区庇护' },
      factions: { municipal_echo: '交易' },
      companions: [{ id: 'lin_xiaoman', condition: '创伤', trustDelta: -70 }],
    })

    expect(next.anomalyExposure.global).toBe(100)
    expect(next.anomalyExposure.floor).toBe(35)
    expect(next.districts.temporary_shelter.status).toBe('社区庇护')
    expect(next.factions.municipal_echo.relation).toBe('交易')
    expect(next.companions.lin_xiaoman.condition).toBe('创伤')
    expect(next.companions.lin_xiaoman.trust).toBe(0)
  })
})

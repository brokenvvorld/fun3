import { describe, expect, it } from 'vitest'
import { initialWorldState } from '../state'
import { applyChoiceEffect } from './choices'

describe('choice effects', () => {
  it('applies resource and flag consequences', () => {
    const next = applyChoiceEffect(initialWorldState, {
      resources: { food: 2, water: -1 },
      flags: { civicEngineKnown: true },
    })

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

  it('updates registry paperwork without rewriting the player name', () => {
    const next = applyChoiceEffect(initialWorldState, {
      protagonist: {
        registryNameStatus: '被档案读取',
        permitStatus: '临时通行条已接入市脉机枢',
        registryNumber: 'LC-REG-009',
      },
    })

    expect(next.protagonist.displayName).toBe(initialWorldState.protagonist.displayName)
    expect(next.protagonist.registryNameStatus).toBe('被档案读取')
    expect(next.protagonist.permitStatus).toBe('临时通行条已接入市脉机枢')
    expect(next.protagonist.registryNumber).toBe('LC-REG-009')
  })

  it('tracks quest progress and ending locks in existing world state fields', () => {
    const first = applyChoiceEffect(initialWorldState, {
      quests: { activate: ['chapter-1-archive'], complete: ['chapter-1'] },
      endingLocks: {
        negotiation: { status: '入口开启', note: '客服中心承认玩家可作为临时代办人。' },
      },
    })
    const second = applyChoiceEffect(first, {
      quests: { activate: ['chapter-1-archive'], fail: ['chapter-1-archive'] },
      endingLocks: {
        negotiation: { note: '同一入口再次记录时保留最新备注。' },
      },
    })

    expect(first.quests.active).toEqual(['chapter-1-archive'])
    expect(first.quests.completed).toEqual(['chapter-1'])
    expect(second.quests.active).toEqual([])
    expect(second.quests.failed).toEqual(['chapter-1-archive'])
    expect(second.endingLocks.negotiation.status).toBe('入口开启')
    expect(second.endingLocks.negotiation.notes[0]).toBe('同一入口再次记录时保留最新备注。')
  })

  it('keeps place and faction notes distinct from codex handled signals', () => {
    const next = applyChoiceEffect(initialWorldState, {
      districtNotes: { flooded_archive: '档案室水线已与户籍柜号同步。' },
      factionNotes: { municipal_echo: '自动派单开始读取补办编号。' },
      flags: { 'codex.lc_ix_014.discovered': true },
      irreversibleFlags: { 'memory.lc_ix_014.debt_refused': true },
    })

    expect(next.districts.flooded_archive.notes[0]).toBe('档案室水线已与户籍柜号同步。')
    expect(next.factions.municipal_echo.notes[0]).toBe('自动派单开始读取补办编号。')
    expect(next.flags['codex.lc_ix_014.discovered']).toBe(true)
    expect(next.irreversibleFlags['memory.lc_ix_014.debt_refused']).toBe(true)
  })
})

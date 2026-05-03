import { beforeEach, describe, expect, it } from 'vitest'
import { initialWorldState } from '../../game/simulation/state'
import { clearSaveGame, hasSaveGame, loadSaveGame, saveGame } from './saveGame'

const SAVE_KEY = 'fun3.chapter1.save.v2'
const LEGACY_SAVE_KEY = 'fun3.chapter1.save.v1'
const VALID_SAVE = {
  version: 2,
  screen: 'playing',
  world: initialWorldState,
  procedureLog: [],
  debugVisible: false,
  musicEnabled: false,
  soundEnabled: true,
  captionsEnabled: true,
}

describe('save game storage', () => {
  beforeEach(() => {
    clearSaveGame()
  })

  it('saves, loads, and clears a chapter progress snapshot', () => {
    expect(hasSaveGame()).toBe(false)
    window.localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify({ version: 1, world: initialWorldState }))

    saveGame({
      version: 2,
      screen: 'playing',
      storyStateJson: '{"state":true}',
      world: initialWorldState,
      procedureLog: [{ id: 'r1', title: '手续回执', summary: '测试回执' }],
      investigationFeedback: { stamp_machine: ['机器正在等纸。'] },
      debugVisible: true,
      musicEnabled: false,
      soundEnabled: true,
      captionsEnabled: true,
    })

    expect(hasSaveGame()).toBe(true)
    expect(loadSaveGame()?.storyStateJson).toBe('{"state":true}')
    expect(loadSaveGame()?.procedureLog[0].summary).toBe('测试回执')
    expect(loadSaveGame()?.investigationFeedback?.stamp_machine).toEqual(['机器正在等纸。'])
    expect(window.localStorage.getItem(LEGACY_SAVE_KEY)).toBeNull()

    clearSaveGame()
    expect(loadSaveGame()).toBeNull()
  })

  it('discards legacy v1 saves instead of migrating time-bearing state', () => {
    window.localStorage.setItem(
      LEGACY_SAVE_KEY,
      JSON.stringify({
        version: 1,
        clock: { day: 1, hour: 8, minute: 30 },
        world: initialWorldState,
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(LEGACY_SAVE_KEY)).toBeNull()
  })

  it('removes incompatible or corrupted v2 saves', () => {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, world: initialWorldState }))

    expect(hasSaveGame()).toBe(false)
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, world: initialWorldState }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, '{bad json')

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 2, screen: 'debugPanel', world: initialWorldState }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 2, screen: 'playing' }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...VALID_SAVE, procedureLog: {} }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...VALID_SAVE, procedureLog: [{ id: 'r1', title: '手续回执', summary: 404 }] }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...VALID_SAVE, musicEnabled: 'false' }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...VALID_SAVE, investigationFeedback: { stamp_machine: ['正常反馈', 404] } }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...VALID_SAVE, storyStateJson: { state: true } }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...VALID_SAVE, world: { ...initialWorldState, companions: {} } }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: { ...initialWorldState, anomalyExposure: { ...initialWorldState.anomalyExposure, districts: {} } },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: {
          ...initialWorldState,
          endingLocks: {
            ...initialWorldState.endingLocks,
            city_restart: { ...initialWorldState.endingLocks.city_restart, status: '已通关' },
          },
        },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: {
          ...initialWorldState,
          companions: {
            ...initialWorldState.companions,
            lin_xiaoman: { ...initialWorldState.companions.lin_xiaoman, condition: '调岗' },
          },
        },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: {
          ...initialWorldState,
          districts: {
            ...initialWorldState.districts,
            temporary_shelter: { ...initialWorldState.districts.temporary_shelter, status: '无限通行' },
          },
        },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: { ...initialWorldState, protagonist: { ...initialWorldState.protagonist, registryNameStatus: '已任命' } },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: { ...initialWorldState, protagonist: { ...initialWorldState.protagonist, registryNumber: 404 } },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...VALID_SAVE, world: { ...initialWorldState, districts: [] } }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: {
          ...initialWorldState,
          endingLocks: {
            ...initialWorldState.endingLocks,
            city_restart: { ...initialWorldState.endingLocks.city_restart, notes: ['正常备注', 404] },
          },
        },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: {
          ...initialWorldState,
          companions: {
            ...initialWorldState.companions,
            lin_xiaoman: { ...initialWorldState.companions.lin_xiaoman, trust: '52' },
          },
        },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: {
          ...initialWorldState,
          factions: {
            ...initialWorldState.factions,
            queue_authority: { ...initialWorldState.factions.queue_authority, relation: '雇佣' },
          },
        },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: {
          ...initialWorldState,
          districts: {
            ...initialWorldState.districts,
            temporary_shelter: { ...initialWorldState.districts.temporary_shelter, notes: ['正常备注', 404] },
          },
        },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: {
          ...initialWorldState,
          anomalyExposure: {
            ...initialWorldState.anomalyExposure,
            districts: { ...initialWorldState.anomalyExposure.districts, temporary_shelter: '8' },
          },
        },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: { ...initialWorldState, quests: { ...initialWorldState.quests, completed: [404] } },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...VALID_SAVE, world: { ...initialWorldState, flags: [] } }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        world: { ...initialWorldState, anomalyExposure: { ...initialWorldState.anomalyExposure, global: '12' } },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()
  })

  it('serializes procedure logs without removed transient UI fields', () => {
    saveGame({
      version: 2,
      screen: 'playing',
      world: initialWorldState,
      procedureLog: [{ id: 'r1', title: '手续回执', summary: '测试回执' }],
      debugVisible: false,
      musicEnabled: false,
      soundEnabled: true,
      captionsEnabled: true,
    })

    const rawSave = window.localStorage.getItem(SAVE_KEY) ?? ''

    expect(rawSave).not.toContain('timestamp')
    expect(rawSave).not.toContain('clock')
    expect(rawSave).not.toContain('WorldClock')
    expect(rawSave).not.toContain('actionFeedback')
    expect(rawSave).not.toContain('storyView')
  })
})

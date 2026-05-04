import { beforeEach, describe, expect, it } from 'vitest'
import { initialWorldState } from '../../game/simulation/state'
import { SAVE_KEY, V2_SAVE_KEY, clearSaveGame, hasSaveGame, loadSaveGame, saveGame } from './saveGame'

const LEGACY_SAVE_KEY = 'fun3.chapter1.save.v1'
const VALID_SAVE = {
  version: 3,
  screen: 'playing',
  world: initialWorldState,
  choiceMemory: [],
  procedureLog: [],
  debugVisible: false,
  musicEnabled: false,
  soundEnabled: true,
  captionsEnabled: true,
  textSpeed: 'standard',
}

describe('save game storage', () => {
  beforeEach(() => {
    clearSaveGame()
  })

  it('saves, loads, and clears a chapter progress snapshot', () => {
    expect(hasSaveGame()).toBe(false)
    window.localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify({ version: 1, world: initialWorldState }))

    saveGame({
      version: 3,
      screen: 'playing',
      storyStateJson: '{"state":true}',
      readingFrame: {
        title: '测试场景',
        location: '测试窗口',
        text: ['当前正文'],
        canContinue: true,
        notices: ['notice:test'],
        receipts: [],
        tags: ['screen:title=测试场景'],
        isComplete: false,
      },
      world: initialWorldState,
      choiceMemory: ['继续办理'],
      procedureLog: [{ id: 'r1', title: '手续回执', summary: '测试回执' }],
      investigationFeedback: { stamp_machine: ['机器正在等纸。'] },
      debugVisible: true,
      musicEnabled: false,
      soundEnabled: true,
      captionsEnabled: true,
      textSpeed: 'fast',
    })

    expect(hasSaveGame()).toBe(true)
    expect(loadSaveGame()?.storyStateJson).toBe('{"state":true}')
    expect(loadSaveGame()?.readingFrame?.text).toEqual(['当前正文'])
    expect(loadSaveGame()?.choiceMemory).toEqual(['继续办理'])
    expect(loadSaveGame()?.procedureLog[0].summary).toBe('测试回执')
    expect(loadSaveGame()?.investigationFeedback?.stamp_machine).toEqual(['机器正在等纸。'])
    expect(loadSaveGame()?.textSpeed).toBe('fast')
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

  it('migrates compatible v2 saves into the current save shape', () => {
    window.localStorage.setItem(
      V2_SAVE_KEY,
      JSON.stringify({
        version: 2,
        screen: 'playing',
        storyStateJson: '{"state":true}',
        world: initialWorldState,
        investigationFeedback: { stamp_machine: ['旧反馈'] },
        procedureLog: [{ id: 'old-r1', title: '手续回执', summary: '旧回执' }],
        debugVisible: false,
        musicEnabled: false,
        soundEnabled: true,
        captionsEnabled: true,
      }),
    )

    const save = loadSaveGame()

    expect(save).toMatchObject({
      version: 3,
      screen: 'playing',
      storyStateJson: '{"state":true}',
      choiceMemory: [],
      textSpeed: 'standard',
    })
    expect(save?.readingFrame).toBeUndefined()
    expect(save?.investigationFeedback?.stamp_machine).toEqual(['旧反馈'])
    expect(save?.procedureLog[0]?.summary).toBe('旧回执')
  })

  it('removes incompatible or corrupted current saves', () => {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, world: initialWorldState }))

    expect(hasSaveGame()).toBe(false)
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 2, world: initialWorldState }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, '{bad json')

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...VALID_SAVE, screen: 'debugPanel' }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 3, screen: 'playing' }))

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

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...VALID_SAVE, storyStateJson: '{bad ink state' }))

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
        readingFrame: {
          title: '测试',
          location: '测试',
          text: ['正文'],
          canContinue: 'yes',
          notices: [],
          receipts: [],
          tags: [],
          isComplete: false,
        },
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...VALID_SAVE,
        choiceMemory: ['正常选择', 404],
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()

    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...VALID_SAVE, textSpeed: 'instant' }))

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

  it('removes incompatible or corrupted v2 saves instead of migrating them', () => {
    window.localStorage.setItem(V2_SAVE_KEY, JSON.stringify({ version: 2, screen: 'playing' }))

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(V2_SAVE_KEY)).toBeNull()

    window.localStorage.setItem(V2_SAVE_KEY, '{bad json')

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(V2_SAVE_KEY)).toBeNull()

    window.localStorage.setItem(
      V2_SAVE_KEY,
      JSON.stringify({
        version: 2,
        screen: 'playing',
        world: initialWorldState,
        procedureLog: {},
        debugVisible: false,
        musicEnabled: false,
        soundEnabled: true,
        captionsEnabled: true,
      }),
    )

    expect(loadSaveGame()).toBeNull()
    expect(window.localStorage.getItem(V2_SAVE_KEY)).toBeNull()
  })

  it('serializes procedure logs without removed transient UI fields', () => {
    saveGame({
      version: 3,
      screen: 'playing',
      world: initialWorldState,
      choiceMemory: [],
      procedureLog: [{ id: 'r1', title: '手续回执', summary: '测试回执' }],
      debugVisible: false,
      musicEnabled: false,
      soundEnabled: true,
      captionsEnabled: true,
      textSpeed: 'standard',
    })

    const rawSave = window.localStorage.getItem(SAVE_KEY) ?? ''

    expect(rawSave).not.toContain('timestamp')
    expect(rawSave).not.toContain('clock')
    expect(rawSave).not.toContain('WorldClock')
    expect(rawSave).not.toContain('actionFeedback')
    expect(rawSave).not.toContain('storyView')
  })
})

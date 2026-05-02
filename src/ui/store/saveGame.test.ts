import { beforeEach, describe, expect, it } from 'vitest'
import { initialWorldState } from '../../game/simulation/state'
import { clearSaveGame, hasSaveGame, loadSaveGame, saveGame } from './saveGame'

describe('save game storage', () => {
  beforeEach(() => {
    clearSaveGame()
  })

  it('saves, loads, and clears a chapter progress snapshot', () => {
    expect(hasSaveGame()).toBe(false)

    saveGame({
      version: 1,
      screen: 'playing',
      storyStateJson: '{"state":true}',
      world: initialWorldState,
      procedureLog: [{ id: 'r1', title: '手续回执', summary: '测试回执' }],
      debugVisible: true,
      musicEnabled: false,
      soundEnabled: true,
      captionsEnabled: true,
    })

    expect(hasSaveGame()).toBe(true)
    expect(loadSaveGame()?.storyStateJson).toBe('{"state":true}')
    expect(loadSaveGame()?.procedureLog[0].summary).toBe('测试回执')

    clearSaveGame()
    expect(loadSaveGame()).toBeNull()
  })
})

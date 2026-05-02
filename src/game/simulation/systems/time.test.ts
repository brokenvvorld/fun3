import { describe, expect, it } from 'vitest'
import { initialWorldState } from '../state'
import { advanceClock, formatClock, spendTime } from './time'

describe('world time system', () => {
  it('advances across days', () => {
    expect(advanceClock({ day: 1, hour: 23, minute: 50 }, 25)).toEqual({
      day: 2,
      hour: 0,
      minute: 15,
    })
  })

  it('formats the independent world clock', () => {
    expect(formatClock({ day: 3, hour: 6, minute: 5 })).toBe('第 3 日 06:05')
  })

  it('spends time without mutating the original state', () => {
    const next = spendTime(initialWorldState, 120)
    expect(next.clock).toEqual({ day: 1, hour: 9, minute: 30 })
    expect(next.resources.morale).toBe(initialWorldState.resources.morale - 2)
    expect(initialWorldState.clock).toEqual({ day: 1, hour: 7, minute: 30 })
  })
})

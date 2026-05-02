import type { WorldClock, WorldState } from '../state'

const DAY_MINUTES = 24 * 60

export function advanceClock(clock: WorldClock, minutes: number): WorldClock {
  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new Error('advanceClock requires a non-negative integer minute value')
  }

  const current = (clock.day - 1) * DAY_MINUTES + clock.hour * 60 + clock.minute
  const next = current + minutes

  return {
    day: Math.floor(next / DAY_MINUTES) + 1,
    hour: Math.floor((next % DAY_MINUTES) / 60),
    minute: next % 60,
  }
}

export function spendTime(state: WorldState, minutes: number): WorldState {
  const clock = advanceClock(state.clock, minutes)
  const hoursPassed = minutes / 60
  const moraleLoss = Math.floor(hoursPassed)

  return {
    ...state,
    clock,
    resources: {
      ...state.resources,
      morale: Math.max(0, state.resources.morale - moraleLoss),
    },
  }
}

export function formatClock(clock: WorldClock): string {
  const hour = String(clock.hour).padStart(2, '0')
  const minute = String(clock.minute).padStart(2, '0')
  return `第 ${clock.day} 日 ${hour}:${minute}`
}

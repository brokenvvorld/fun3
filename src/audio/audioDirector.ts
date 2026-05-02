import { Howl, Howler } from 'howler'

let currentLoop: Howl | null = null

export function setMasterMuted(muted: boolean): void {
  Howler.mute(muted)
}

export function stopCurrentLoop(): void {
  currentLoop?.stop()
  currentLoop = null
}

export function createAmbientLoop(src: string): Howl {
  stopCurrentLoop()
  currentLoop = new Howl({
    src: [src],
    loop: true,
    volume: 0.35,
    html5: true,
  })
  return currentLoop
}

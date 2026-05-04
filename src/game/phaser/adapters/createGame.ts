import Phaser from 'phaser'
import { HubDistrictScene } from '../scenes/HubDistrictScene'

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#151816',
    audio: {
      noAudio: true,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: parent.clientWidth,
      height: parent.clientHeight,
    },
    scene: [HubDistrictScene],
  })
}

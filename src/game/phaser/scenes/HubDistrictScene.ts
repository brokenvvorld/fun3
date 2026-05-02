import Phaser from 'phaser'

export class HubDistrictScene extends Phaser.Scene {
  private canvas?: Phaser.GameObjects.Graphics
  private lightTween?: Phaser.Tweens.Tween

  constructor() {
    super('hub-district-scene')
  }

  create(): void {
    this.drawScene()
    this.scale.on('resize', this.drawScene, this)
  }

  shutdown(): void {
    this.scale.off('resize', this.drawScene, this)
  }

  private drawScene(): void {
    const { width, height } = this.scale
    this.lightTween?.stop()
    this.children.removeAll(true)

    this.canvas = this.add.graphics()
    const g = this.canvas
    const horizon = height * 0.48

    g.fillGradientStyle(0xd7b75c, 0xf0ce73, 0x30443f, 0x14201e, 1)
    g.fillRect(0, 0, width, height)

    g.fillStyle(0xffe48c, 0.72)
    g.fillCircle(width * 0.72, height * 0.18, Math.max(48, width * 0.05))
    g.fillStyle(0xffd15d, 0.12)
    g.fillCircle(width * 0.72, height * 0.18, Math.max(130, width * 0.14))

    this.drawBackBuildings(g, width, horizon)
    this.drawServiceHall(g, width, height)
    this.drawQueueAndFlood(g, width, height)
    this.drawForegroundSeal(g, width, height)

    const signal = this.add.rectangle(width * 0.18, height * 0.43, Math.max(96, width * 0.12), 10, 0xf0c35a, 0.62)
    this.lightTween = this.tweens.add({
      targets: signal,
      alpha: { from: 0.18, to: 0.72 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    })
  }

  private drawBackBuildings(g: Phaser.GameObjects.Graphics, width: number, horizon: number): void {
    const blocks = [
      { x: 0.04, w: 0.16, h: 0.34 },
      { x: 0.21, w: 0.12, h: 0.26 },
      { x: 0.34, w: 0.2, h: 0.38 },
      { x: 0.56, w: 0.1, h: 0.24 },
      { x: 0.68, w: 0.18, h: 0.32 },
    ]

    for (const block of blocks) {
      const x = width * block.x
      const w = width * block.w
      const h = horizon * block.h
      g.fillStyle(0x26342f, 0.66)
      g.fillRect(x, horizon - h, w, h)
      g.fillStyle(0xf3d38a, 0.12)
      for (let row = 0; row < 4; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          g.fillRect(x + 12 + col * (w * 0.24), horizon - h + 16 + row * 22, w * 0.11, 7)
        }
      }
    }
  }

  private drawServiceHall(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const hallX = width * 0.08
    const hallY = height * 0.33
    const hallW = width * 0.58
    const hallH = height * 0.38

    g.fillStyle(0x2f3d37, 0.94)
    g.fillRoundedRect(hallX, hallY, hallW, hallH, 10)
    g.fillStyle(0xb74338, 0.95)
    g.fillRect(hallX + hallW * 0.06, hallY + hallH * 0.09, hallW * 0.86, 18)
    g.fillStyle(0xf4ead2, 0.38)
    g.fillRect(hallX + hallW * 0.08, hallY + hallH * 0.18, hallW * 0.8, 5)

    for (let index = 0; index < 7; index += 1) {
      const x = hallX + hallW * (0.1 + index * 0.11)
      g.fillStyle(0xf6d991, 0.22)
      g.fillRect(x, hallY + hallH * 0.33, hallW * 0.055, hallH * 0.34)
      g.fillStyle(0x111715, 0.42)
      g.fillRect(x, hallY + hallH * 0.68, hallW * 0.055, 5)
    }

    g.fillStyle(0x101513, 0.7)
    g.fillRect(hallX + hallW * 0.58, hallY + hallH * 0.54, hallW * 0.22, hallH * 0.37)
    g.fillStyle(0x82a58a, 0.42)
    g.fillRect(hallX + hallW * 0.61, hallY + hallH * 0.59, hallW * 0.16, 18)
  }

  private drawQueueAndFlood(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const groundY = height * 0.72
    g.fillStyle(0x121815, 0.9)
    g.fillRect(0, groundY, width, height - groundY)

    g.fillGradientStyle(0x2b4d4d, 0x355e5e, 0x101b1a, 0x101b1a, 0.6)
    g.fillRect(0, height * 0.78, width, height * 0.22)

    g.lineStyle(2, 0xefe3c8, 0.22)
    g.beginPath()
    g.moveTo(width * 0.1, groundY + 28)
    g.lineTo(width * 0.62, groundY + 2)
    g.lineTo(width * 0.92, groundY + 38)
    g.strokePath()

    for (let index = 0; index < 13; index += 1) {
      const x = width * (0.18 + index * 0.045)
      const y = groundY + 18 + (index % 3) * 8
      g.fillStyle(index % 4 === 0 ? 0xc94d3b : 0xefe3c8, 0.72)
      g.fillCircle(x, y, 4)
      g.fillStyle(0x171715, 0.82)
      g.fillRoundedRect(x - 5, y + 4, 10, 18, 4)
    }
  }

  private drawForegroundSeal(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    g.fillStyle(0xefe3c8, 0.88)
    g.fillRoundedRect(width * 0.05, height * 0.73, width * 0.18, 48, 5)
    g.fillStyle(0xc94d3b, 0.92)
    g.fillRect(width * 0.07, height * 0.745, width * 0.14, 7)
    g.fillStyle(0x0c0f0d, 0.24)
    g.fillRect(width * 0.08, height * 0.765, width * 0.1, 4)

    g.lineStyle(3, 0xc94d3b, 0.36)
    g.strokeCircle(width * 0.14, height * 0.82, Math.max(34, width * 0.035))
  }
}

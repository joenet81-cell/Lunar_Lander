import Phaser from 'phaser'
import { Leaderboard } from '../systems/Leaderboard.js'
import { AudioSystem } from '../systems/AudioSystem.js'

export class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene') }

  init(data) {
    this.result = data.result
    this.score = data.score
    this.level = data.level
    this.fuelLeft = data.fuelLeft
  }

  create() {
    const { width, height } = this.scale
    const isWin = this.result === 'safe'

    // Save score
    if (isWin) {
      Leaderboard.saveScore(this.score, this.level)
      AudioSystem.playSuccess()
    } else {
      AudioSystem.playExplosion()
    }

    // Background tint
    this.add.rectangle(width / 2, height / 2, width, height, isWin ? 0x002200 : 0x220000, 0.85)

    // Title
    const titleText = isWin ? 'SAFE LANDING!' : 'CRASH!'
    const titleColor = isWin ? '#00ff88' : '#ff4444'
    this.add.text(width / 2, height * 0.22, titleText, {
      fontFamily: 'monospace',
      fontSize: '52px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5)

    if (isWin) {
      // Score breakdown
      const lines = [
        `SCORE:    ${this.score}`,
        `LEVEL:    ${this.level}`,
        `FUEL LEFT: ${Math.round(this.fuelLeft)}`,
      ]
      lines.forEach((line, i) => {
        this.add.text(width / 2, height * 0.42 + i * 32, line, {
          fontFamily: 'monospace', fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5)
      })

      const best = Leaderboard.getBest()
      this.add.text(width / 2, height * 0.42 + 3 * 32 + 10, `BEST: ${best}`, {
        fontFamily: 'monospace', fontSize: '14px', color: '#ffff00'
      }).setOrigin(0.5)

      // Next level or retry
      const nextLevel = this.level + 1
      const hasNext = nextLevel <= 10
      if (hasNext) {
        this._addButton(width / 2, height * 0.72, `[ NEXT LEVEL → ${nextLevel} ]`, '#00ff88', () => {
          AudioSystem.init()
          this.scene.start('GameScene', { level: nextLevel })
        })
      }
    } else {
      this.add.text(width / 2, height * 0.48, 'You hit the ground too hard!', {
        fontFamily: 'monospace', fontSize: '16px', color: '#ff8888'
      }).setOrigin(0.5)
    }

    this._addButton(width / 2, height * 0.82, '[ RETRY ]', '#ffff00', () => {
      AudioSystem.init()
      this.scene.start('GameScene', { level: this.level })
    })

    this._addButton(width / 2, height * 0.91, '[ MAIN MENU ]', '#8888ff', () => {
      this.scene.start('MenuScene')
    })
  }

  _addButton(x, y, label, color, cb) {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '18px', color
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    btn.on('pointerover', () => btn.setAlpha(0.7))
    btn.on('pointerout', () => btn.setAlpha(1))
    btn.on('pointerdown', cb)
    return btn
  }
}

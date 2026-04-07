import Phaser from 'phaser'
import { Leaderboard } from '../systems/Leaderboard.js'

export class LeaderboardScene extends Phaser.Scene {
  constructor() { super('LeaderboardScene') }

  create() {
    const { width, height } = this.scale

    this.add.rectangle(width / 2, height / 2, width, height, 0x000011, 1)

    // Stars
    for (let i = 0; i < 100; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2),
        0xffffff, Phaser.Math.FloatBetween(0.2, 0.8)
      )
    }

    this.add.text(width / 2, 50, 'LEADERBOARD', {
      fontFamily: 'monospace', fontSize: '36px', color: '#ffff00',
      stroke: '#884400', strokeThickness: 4
    }).setOrigin(0.5)

    const scores = Leaderboard.getAll()

    if (scores.length === 0) {
      this.add.text(width / 2, height / 2, 'No scores yet.\nLand safely to set a record!', {
        fontFamily: 'monospace', fontSize: '18px', color: '#888888', align: 'center'
      }).setOrigin(0.5)
    } else {
      this.add.text(width / 2, 110, '#   SCORE    LEVEL    DATE', {
        fontFamily: 'monospace', fontSize: '13px', color: '#446666'
      }).setOrigin(0.5)

      scores.slice(0, 10).forEach((entry, i) => {
        const color = i === 0 ? '#ffdd00' : i < 3 ? '#aaaaaa' : '#666688'
        const rank = `${i + 1}`.padStart(2, ' ')
        const sc = `${entry.score}`.padStart(6, ' ')
        const lv = `${entry.level}`.padStart(5, ' ')
        const dt = entry.date || ''
        this.add.text(width / 2, 140 + i * 34, `${rank}   ${sc}    LVL${lv}    ${dt}`, {
          fontFamily: 'monospace', fontSize: '16px', color
        }).setOrigin(0.5)
      })
    }

    const back = this.add.text(width / 2, height - 40, '[ BACK ]', {
      fontFamily: 'monospace', fontSize: '18px', color: '#8888ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    back.on('pointerover', () => back.setColor('#ffffff'))
    back.on('pointerout', () => back.setColor('#8888ff'))
    back.on('pointerdown', () => this.scene.start('MenuScene'))

    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'))
    this.input.keyboard.on('keydown-BACK_SPACE', () => this.scene.start('MenuScene'))

    const clrBtn = this.add.text(width - 20, height - 40, '[ CLEAR ]', {
      fontFamily: 'monospace', fontSize: '12px', color: '#882222'
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true })
    clrBtn.on('pointerdown', () => {
      Leaderboard.clear()
      this.scene.restart()
    })
  }
}

import Phaser from 'phaser'
import { LEVELS } from '../systems/Levels.js'
import { AudioSystem } from '../systems/AudioSystem.js'

const SCENES_TO_STOP = ['MenuScene', 'GameScene', 'HUDScene', 'ResultScene', 'LeaderboardScene']

export class DevScene extends Phaser.Scene {
  constructor() { super({ key: 'DevScene', active: false }) }

  create() {
    this._visible = false
    this._objects = []

    // Intercept Ctrl+R at DOM level to prevent browser reload
    this._onKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        e.stopPropagation()
        this._toggle()
      }
    }
    document.addEventListener('keydown', this._onKeyDown)

    // ESC to close
    this.input.keyboard.on('keydown-ESC', () => {
      if (this._visible) this._hide()
    })
  }

  _toggle() {
    this._visible ? this._hide() : this._show()
  }

  _show() {
    this._visible = true
    const { width, height } = this.scale

    const panelW = Math.min(560, width * 0.85)
    const panelH = 320
    const cx = width / 2
    const cy = height / 2

    // Dim backdrop
    const backdrop = this.add.rectangle(cx, cy, width, height, 0x000000, 0.72).setDepth(200)

    // Panel background
    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x111122, 1)
      .setStrokeStyle(2, 0x4466ff).setDepth(201)

    // Title
    const title = this.add.text(cx, cy - panelH / 2 + 22, 'DEV — SELECT LEVEL', {
      fontFamily: 'monospace', fontSize: '15px', color: '#4499ff'
    }).setOrigin(0.5).setDepth(202)

    const hint = this.add.text(cx, cy - panelH / 2 + 40, 'Click a level or press ESC to cancel', {
      fontFamily: 'monospace', fontSize: '10px', color: '#555577'
    }).setOrigin(0.5).setDepth(202)

    // Level grid: 2 rows × 5 cols
    const cols   = 5
    const btnW   = (panelW - 40) / cols - 8
    const btnH   = 52
    const startX = cx - panelW / 2 + 20 + btnW / 2
    const startY = cy - 48

    const buttons = []
    for (let i = 0; i < LEVELS.length; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const bx  = startX + col * (btnW + 8)
      const by  = startY + row * (btnH + 10)
      const lvl = LEVELS[i]

      const bg = this.add.rectangle(bx, by, btnW, btnH, 0x1a1a33)
        .setStrokeStyle(1, 0x334466).setDepth(202).setInteractive({ useHandCursor: true })

      const numTxt = this.add.text(bx, by - 10, `${i + 1}`, {
        fontFamily: 'monospace', fontSize: '18px', color: '#ffffff'
      }).setOrigin(0.5).setDepth(203)

      const nameTxt = this.add.text(bx, by + 10, lvl.label || '', {
        fontFamily: 'monospace', fontSize: '8px', color: '#aaaacc'
      }).setOrigin(0.5).setDepth(203)

      const level = i + 1
      bg.on('pointerover',  () => { bg.setFillColor(0x2233aa); numTxt.setColor('#ffff00') })
      bg.on('pointerout',   () => { bg.setFillColor(0x1a1a33); numTxt.setColor('#ffffff') })
      bg.on('pointerdown',  () => this._launch(level))

      buttons.push(bg, numTxt, nameTxt)
    }

    // Cancel button
    const cancelBtn = this.add.text(cx, cy + panelH / 2 - 20, '[ ESC — CANCEL ]', {
      fontFamily: 'monospace', fontSize: '11px', color: '#555577'
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true })
    cancelBtn.on('pointerover',  () => cancelBtn.setColor('#aaaacc'))
    cancelBtn.on('pointerout',   () => cancelBtn.setColor('#555577'))
    cancelBtn.on('pointerdown',  () => this._hide())

    this._objects = [backdrop, panel, title, hint, cancelBtn, ...buttons]
  }

  _hide() {
    this._visible = false
    this._objects.forEach(o => o.destroy())
    this._objects = []
  }

  _launch(level) {
    this._hide()
    AudioSystem.init()
    // Use scene.manager.stop() (immediate) instead of scene.stop() (queued).
    // scene.stop() queues the operation for the next frame — by then,
    // manager.start() has already created the new GameScene, so the queued
    // stop fires and kills it. manager.stop() executes synchronously.
    SCENES_TO_STOP.forEach(key => {
      if (this.scene.isActive(key) || this.scene.isPaused(key)) {
        this.scene.manager.stop(key)
      }
    })
    this.scene.manager.start('GameScene', { level })
  }

  shutdown() {
    document.removeEventListener('keydown', this._onKeyDown)
  }
}

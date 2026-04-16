import Phaser from 'phaser'
import { Ship } from '../entities/Ship.js'
import { Terrain } from '../entities/Terrain.js'
import { CeilingRocks } from '../entities/CeilingRocks.js'
import { AsteroidSystem } from '../systems/AsteroidSystem.js'
import { LEVELS } from '../systems/Levels.js'
import { AudioSystem } from '../systems/AudioSystem.js'
import { ParticleSystem } from '../systems/ParticleSystem.js'

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene') }

  init(data) {
    this.levelIndex = (data.level || 1) - 1
    this.levelData = LEVELS[this.levelIndex]
    this.paused = false
  }

  create() {
    const { width, height } = this.scale
    const dir = this.levelData.mapDirection || 'right'

    // World dimensions based on map direction
    const worldWidth  = dir === 'right' ? width * 2 : width
    const worldHeight = dir === 'up'    ? height * 2 : height
    this.worldWidth  = worldWidth
    this.worldHeight = worldHeight

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)

    // Starfield across full world
    this.starGfx = this.add.graphics()
    this._drawStars(worldWidth, worldHeight)

    // Terrain spanning full world
    this.terrain = new Terrain(this, this.levelData, worldWidth, worldHeight)

    // Ship — spawn on the launch base
    const lp     = this.terrain.launchPad
    const spawnX = lp.startX + (lp.endX - lp.startX) / 2
    const spawnY = lp.y - 19
    this.ship = new Ship(this, spawnX, spawnY, this.levelData)

    // Launch prompt
    this.launchPrompt = this.add.text(spawnX, lp.y - 60, '↑ PRESS UP TO LAUNCH', {
      fontFamily: 'monospace', fontSize: '13px', color: '#55ddff'
    }).setOrigin(0.5, 1).setDepth(20)
    this.tweens.add({ targets: this.launchPrompt, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 })

    this.particles   = new ParticleSystem(this)
    this.ceilingRocks = new CeilingRocks(this, this.levelData, worldWidth, this.terrain.landingPad)
    this.asteroids    = new AsteroidSystem(this, this.levelData, worldWidth, worldHeight)

    // Camera
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.startFollow(this.ship.sprite, true, 0.08, 0.06)

    // UI overlays (all scrollFactor 0)
    this._initMinimap(width, height, worldWidth, worldHeight)
    this._initWaypoint()
    this._showLevelBanner(width, height)

    this.scene.launch('HUDScene', { gameScene: this })

    this.input.keyboard.on('keydown-ESC', () => this._togglePause())
    this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(100).setVisible(false)
    this.pauseText = this.add.text(width / 2, height / 2, 'PAUSED\n\nESC to resume\nM for menu', {
      fontFamily: 'monospace', fontSize: '28px', color: '#ffffff', align: 'center'
    }).setScrollFactor(0).setOrigin(0.5).setDepth(101).setVisible(false)
    this.input.keyboard.on('keydown-M', () => { if (this.paused) this._goMenu() })
  }

  // ── Minimap ──────────────────────────────────────────────────

  _initMinimap(vw, vh, ww, wh) {
    // Size: keep aspect ratio of world, fit in ~140×110 box
    const maxW = 140, maxH = 110
    const asp  = ww / wh
    let mmW, mmH
    if (asp >= 1) { mmW = maxW; mmH = Math.max(20, Math.round(maxW / asp)) }
    else          { mmH = maxH; mmW = Math.max(20, Math.round(maxH * asp)) }

    const mmX = vw - mmW - 8
    const mmY = 8

    this._mm = { x: mmX, y: mmY, w: mmW, h: mmH, scX: mmW / ww, scY: mmH / wh }
    this.minimapGfx = this.add.graphics().setScrollFactor(0).setDepth(30)
  }

  _updateMinimap() {
    const m   = this._mm
    if (!m) return
    const gfx = this.minimapGfx
    const cam = this.cameras.main
    gfx.clear()

    // Background
    gfx.fillStyle(0x000011, 0.82)
    gfx.fillRect(m.x, m.y, m.w, m.h)

    // Terrain silhouette
    if (this.terrain?.points?.length) {
      gfx.lineStyle(1, 0x8844cc, 0.55)
      gfx.beginPath()
      this.terrain.points.forEach((p, i) => {
        const px = m.x + p.x * m.scX, py = m.y + p.y * m.scY
        i === 0 ? gfx.moveTo(px, py) : gfx.lineTo(px, py)
      })
      gfx.strokePath()
    }

    // Camera viewport rect
    gfx.lineStyle(1, 0x334466, 0.6)
    gfx.strokeRect(
      m.x + cam.scrollX * m.scX,
      m.y + cam.scrollY * m.scY,
      this.scale.width  * m.scX,
      this.scale.height * m.scY
    )

    // Launch pad (cyan)
    const lp = this.terrain.launchPad
    if (lp) {
      const cx = m.x + ((lp.startX + lp.endX) / 2) * m.scX
      const cy = m.y + lp.y * m.scY
      gfx.fillStyle(0x55ddff, 0.9)
      gfx.fillRect(cx - 4, cy - 3, 8, 3)
    }

    // Landing pad (orange)
    const dp = this.terrain.landingPad
    if (dp) {
      const cx = m.x + ((dp.startX + dp.endX) / 2) * m.scX
      const cy = m.y + dp.y * m.scY
      gfx.fillStyle(0xffaa00, 0.9)
      gfx.fillRect(cx - 4, cy - 3, 8, 3)
    }

    // Ship dot
    if (this.ship) {
      gfx.fillStyle(0xffffff, 1)
      gfx.fillCircle(m.x + this.ship.x * m.scX, m.y + this.ship.y * m.scY, 2.5)
    }

    // Border
    gfx.lineStyle(1, 0x4466aa, 0.85)
    gfx.strokeRect(m.x, m.y, m.w, m.h)
  }

  // ── Waypoint arrow ───────────────────────────────────────────

  _initWaypoint() {
    this.waypointGfx = this.add.graphics().setScrollFactor(0).setDepth(25)
    this._waypointDistTxt = this.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffaa00'
    }).setScrollFactor(0).setDepth(26).setOrigin(0.5).setVisible(false)
  }

  _updateWaypoint() {
    const gfx = this.waypointGfx
    gfx.clear()
    if (!this.ship || !this.terrain?.landingPad || this.ship.dead || this.ship.landed) return

    const { width, height } = this.scale
    const cam = this.cameras.main
    const lp  = this.terrain.landingPad
    const padCX = (lp.startX + lp.endX) / 2
    const padCY = lp.y

    // Landing pad position in screen space
    const screenX = padCX - cam.scrollX
    const screenY = padCY - cam.scrollY

    const margin = 38
    const onScreen = screenX > margin && screenX < width - margin &&
                     screenY > margin && screenY < height - margin

    // Direction from ship to pad
    const dx = padCX - this.ship.x
    const dy = padCY - this.ship.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const ang  = Math.atan2(dy, dx)

    // Pulse alpha
    const pulse = 0.65 + Math.sin(this.time.now * 0.005) * 0.35

    if (onScreen) {
      // Target rings directly on the pad
      gfx.lineStyle(2, 0xffaa00, pulse)
      gfx.strokeCircle(screenX, screenY, 22)
      gfx.lineStyle(1, 0xffaa00, pulse * 0.5)
      gfx.strokeCircle(screenX, screenY, 30)
      // Center dot
      gfx.fillStyle(0xffaa00, pulse)
      gfx.fillCircle(screenX, screenY, 4)
    } else {
      // Arrow at screen edge pointing toward pad
      const edgeM = 32
      const hw = width  / 2 - edgeM
      const hh = height / 2 - edgeM
      const coeff = Math.min(
        hw / (Math.abs(Math.cos(ang)) + 0.001),
        hh / (Math.abs(Math.sin(ang)) + 0.001)
      )
      const ax = width  / 2 + Math.cos(ang) * coeff
      const ay = height / 2 + Math.sin(ang) * coeff

      const sz = 14
      const tip  = { x: ax + Math.cos(ang) * sz,          y: ay + Math.sin(ang) * sz }
      const left = { x: ax + Math.cos(ang + 2.4) * sz * 0.55, y: ay + Math.sin(ang + 2.4) * sz * 0.55 }
      const rght = { x: ax + Math.cos(ang - 2.4) * sz * 0.55, y: ay + Math.sin(ang - 2.4) * sz * 0.55 }

      gfx.fillStyle(0xffaa00, pulse)
      gfx.fillTriangle(tip.x, tip.y, left.x, left.y, rght.x, rght.y)

      // Distance label
      const distTxt = dist > 999 ? `${(dist / 100 | 0) * 100}m` : `${dist | 0}m`
      const labelX  = ax + Math.cos(ang + Math.PI) * 22
      const labelY  = ay + Math.sin(ang + Math.PI) * 22 - 6
      // Small distance text using Phaser graphics (just the arrow is enough, text is costly to draw per-frame)
      // We'll use a persistent text object instead
      if (this._waypointDistTxt) {
        this._waypointDistTxt.setText(distTxt).setPosition(labelX, labelY).setVisible(true).setAlpha(pulse)
      }
    }

    if (this._waypointDistTxt && onScreen) this._waypointDistTxt.setVisible(false)
  }

  _showLevelBanner(width, height) {
    const lvl = this.levelData
    const lines = [
      `LEVEL ${this.levelIndex + 1} — ${lvl.label || ''}`,
      `GRAVITY ${lvl.gravity} · FUEL ${lvl.startFuel}` +
      (lvl.wind       ? ` · WIND ${lvl.wind > 0 ? '→' : '←'}` : '') +
      (lvl.ceilingRocks ? ` · CAVE ROCKS` : '') +
      (lvl.asteroids  ? ` · ASTEROIDS` : '')
    ]

    const bg = this.add.rectangle(width / 2, height / 2 - 20, width * 0.55, 70, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(50)
    const txt = this.add.text(width / 2, height / 2 - 20, lines.join('\n'), {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffff00', align: 'center'
    }).setScrollFactor(0).setOrigin(0.5).setDepth(51)

    this.time.delayedCall(2200, () => {
      this.tweens.add({ targets: [bg, txt], alpha: 0, duration: 400, onComplete: () => { bg.destroy(); txt.destroy() } })
    })
  }

  _drawStars(width, height) {
    this.starGfx.clear()
    const starCount = Math.round((width * height) / 3000)
    for (let i = 0; i < starCount; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const size = Math.random() < 0.8 ? 1 : 2
      const brightness = Phaser.Math.Between(100, 255)
      this.starGfx.fillStyle(Phaser.Display.Color.GetColor(brightness, brightness, brightness))
      this.starGfx.fillRect(x, y, size, size)
    }
  }

  _togglePause() {
    this.paused = !this.paused
    this.pauseOverlay.setVisible(this.paused)
    this.pauseText.setVisible(this.paused)
    if (this.paused) {
      this.physics.pause()
      AudioSystem.stopThrust()
    } else {
      this.physics.resume()
    }
  }

  _goMenu() {
    this.paused = false
    this.physics.resume()
    AudioSystem.stopThrust()
    this.scene.stop('HUDScene')
    this.scene.start('MenuScene')
  }

  endGame(result) {
    AudioSystem.stopThrust()
    this.ship.controls = null
    this.scene.stop('HUDScene')

    const score = this._calcScore(result)
    this.scene.start('ResultScene', {
      result,
      score,
      level: this.levelIndex + 1,
      fuelLeft: this.ship.fuel
    })
  }

  _calcScore(result) {
    if (result === 'crash') return 0
    const speedBonus = Math.max(0, 100 - Math.round(this.ship.landingSpeed * 10))
    const angleBonus = Math.max(0, 50 - Math.round(Math.abs(this.ship.landingAngle)))
    const fuelBonus = Math.round(this.ship.fuel * 0.5)
    return speedBonus + angleBonus + fuelBonus + (this.levelIndex + 1) * 50
  }

  update() {
    if (this.paused || !this.ship) return
    this.ship.update()
    this.particles.update()
    this.terrain.checkLanding(this.ship)

    // Hide launch prompt once ship departs
    if (this.launchPrompt && this.launchPrompt.visible && !this.ship.parked) {
      this.launchPrompt.setVisible(false)
    }

    if (!this.ship.dead && !this.ship.landed) {
      // Ceiling rock collision
      if (this.ceilingRocks && this.ceilingRocks.checkCollision(this.ship)) {
        this.ship.kill()
        return
      }
      // Asteroid collision
      if (this.asteroids && this.asteroids.checkCollision(this.ship)) {
        this.ship.kill()
        return
      }
    }

    const dt = this.game.loop.delta / 1000
    this.asteroids && this.asteroids.update(dt)

    this._updateMinimap()
    this._updateWaypoint()
  }
}

import Phaser from 'phaser'
import { Ship } from '../entities/Ship.js'
import { Terrain } from '../entities/Terrain.js'
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

    // Starfield
    this.starGfx = this.add.graphics()
    this._drawStars(width, height)

    // Terrain
    this.terrain = new Terrain(this, this.levelData)

    // Ship
    const spawn = this.levelData.spawnPoint || { x: width / 2, y: 80 }
    this.ship = new Ship(this, spawn.x, spawn.y, this.levelData)

    // Particle system
    this.particles = new ParticleSystem(this)

    // HUD scene overlay
    this.scene.launch('HUDScene', { gameScene: this })

    // Pause
    this.input.keyboard.on('keydown-ESC', () => this._togglePause())

    // Dim overlay for pause
    this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
      .setDepth(100).setVisible(false)
    this.pauseText = this.add.text(width / 2, height / 2, 'PAUSED\n\nESC to resume\nM for menu', {
      fontFamily: 'monospace', fontSize: '28px', color: '#ffffff', align: 'center'
    }).setOrigin(0.5).setDepth(101).setVisible(false)

    this.input.keyboard.on('keydown-M', () => {
      if (this.paused) this._goMenu()
    })
  }

  _drawStars(width, height) {
    this.starGfx.clear()
    for (let i = 0; i < 180; i++) {
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
  }
}

import Phaser from 'phaser'
import { AudioSystem } from '../systems/AudioSystem.js'

const ROTATION_SPEED = 140   // deg/s
const THRUST_FORCE   = 260   // pixels/s²
const MAX_FUEL       = 500

export class Ship {
  constructor(scene, x, y, levelData) {
    this.scene = scene
    this.maxFuel = MAX_FUEL
    this.fuel = levelData.startFuel !== undefined ? levelData.startFuel : MAX_FUEL
    this.gravity = levelData.gravity || 80
    this.thrustMultiplier = levelData.thrustMultiplier || 1
    this.dead = false
    this.landed = false
    this.landingSpeed = 0
    this.landingAngle = 0

    // Sprite — scale 0.37 (100×120 px → ~37×44 px displayed)
    this.sprite = scene.physics.add.image(x, y, 'ship')
    this.sprite.setScale(0.37)
    this.sprite.setDepth(10)
    this.sprite.body.allowGravity = false
    this.sprite.body.setCollideWorldBounds(true)

    // Footpads at y=112 of 120px → 52px below center → 52 * 0.37 ≈ 19 world px
    this.hitRadius = 19

    // Starts parked on launch base — physics begin on first thrust
    this.parked = true

    // Wind: constant horizontal force (px/s²), positive = rightward
    this.wind = levelData.wind || 0

    this.controls = scene.input.keyboard.createCursorKeys()

    // Flame emitter — rendered above ship so it's always visible
    this.flameGfx = scene.add.graphics().setDepth(12)

    this.thrustOn = false
    this._thrustWasOn = false
  }

  get x() { return this.sprite.x }
  get y() { return this.sprite.y }
  get body() { return this.sprite.body }
  get angle() { return this.sprite.angle }

  update() {
    if (this.dead || this.landed || !this.controls) return

    const dt = this.scene.game.loop.delta / 1000
    const ctrl = this.controls

    // While parked on launch base, wait for first thrust input
    if (this.parked) {
      if (ctrl.up.isDown && this.fuel > 0) {
        this.parked = false
      } else {
        this._drawFlame(dt)
        return
      }
    }

    // Rotation
    if (ctrl.left.isDown) {
      this.sprite.angle -= ROTATION_SPEED * dt
    } else if (ctrl.right.isDown) {
      this.sprite.angle += ROTATION_SPEED * dt
    }

    // Thrust
    this.thrustOn = ctrl.up.isDown && this.fuel > 0
    if (this.thrustOn) {
      const rad = Phaser.Math.DegToRad(this.sprite.angle - 90)
      const force = THRUST_FORCE * this.thrustMultiplier
      this.sprite.body.velocity.x += Math.cos(rad) * force * dt
      this.sprite.body.velocity.y += Math.sin(rad) * force * dt
      this.fuel = Math.max(0, this.fuel - 30 * dt)
    }

    // Gravity (manual)
    this.sprite.body.velocity.y += this.gravity * dt

    // Wind (constant horizontal push)
    if (this.wind !== 0) {
      this.sprite.body.velocity.x += this.wind * dt
    }

    // Clamp velocity for arcade feel
    const maxV = 400
    this.sprite.body.velocity.x = Phaser.Math.Clamp(this.sprite.body.velocity.x, -maxV, maxV)
    this.sprite.body.velocity.y = Phaser.Math.Clamp(this.sprite.body.velocity.y, -maxV, maxV)

    // Out of top — bounce back
    if (this.sprite.y < 0) {
      this.sprite.y = 0
      this.sprite.body.velocity.y = Math.abs(this.sprite.body.velocity.y)
    }

    // Audio
    if (this.thrustOn && !this._thrustWasOn) AudioSystem.startThrust()
    if (!this.thrustOn && this._thrustWasOn) AudioSystem.stopThrust()
    this._thrustWasOn = this.thrustOn

    // Draw flame
    this._drawFlame(dt)
  }

  _drawFlame(dt) {
    this.flameGfx.clear()
    if (!this.thrustOn) return

    const rad     = Phaser.Math.DegToRad(this.sprite.angle - 90)
    const perpRad = rad + Math.PI / 2

    // 3-engine cluster nozzle exit:
    // sprite center → nozzle tips at y=106 of 120px → 46px below center
    // 46 * 0.37 = 17 world px below sprite center
    const NOZZLE_DOWN = 17
    const ox = this.sprite.x - Math.cos(rad) * NOZZLE_DOWN
    const oy = this.sprite.y - Math.sin(rad) * NOZZLE_DOWN

    // Flame length varies with flicker
    const flameLen = Phaser.Math.Between(18, 34)
    const tipX = ox - Math.cos(rad) * flameLen
    const tipY = oy - Math.sin(rad) * flameLen

    // Flame layers: wide at base, narrow at tip
    // outer glow → mid → core → white hot center
    const layers = [
      { color: 0xff2200, w: 9,   alpha: 0.35 },
      { color: 0xff6600, w: 7,   alpha: 0.55 },
      { color: 0xff9900, w: 5,   alpha: 0.75 },
      { color: 0xffdd00, w: 3.5, alpha: 0.90 },
      { color: 0xffffff, w: 1.5, alpha: 1.0  },
    ]

    for (const { color, w, alpha } of layers) {
      const jitter = (Math.random() - 0.5) * w * 0.5
      this.flameGfx.fillStyle(color, alpha)
      this.flameGfx.fillTriangle(
        ox + Math.cos(perpRad) * w,
        oy + Math.sin(perpRad) * w,
        ox - Math.cos(perpRad) * w,
        oy - Math.sin(perpRad) * w,
        tipX + Math.cos(perpRad) * jitter,
        tipY + Math.sin(perpRad) * jitter
      )
    }

    // Glowing halo at nozzle exit
    this.flameGfx.fillStyle(0xffffff, 0.6)
    this.flameGfx.fillCircle(ox, oy, 4)
    this.flameGfx.fillStyle(0xffdd00, 0.4)
    this.flameGfx.fillCircle(ox, oy, 7)

    // Secondary exhaust shimmer — inner wisp
    const wispLen = Phaser.Math.Between(8, 16)
    const wispTipX = ox - Math.cos(rad) * wispLen
    const wispTipY = oy - Math.sin(rad) * wispLen
    this.flameGfx.fillStyle(0xffffff, 0.25)
    this.flameGfx.fillTriangle(
      ox + Math.cos(perpRad) * 2,
      oy + Math.sin(perpRad) * 2,
      ox - Math.cos(perpRad) * 2,
      oy - Math.sin(perpRad) * 2,
      wispTipX, wispTipY
    )
  }

  kill() {
    if (this.dead) return
    this.dead = true
    AudioSystem.stopThrust()
    this.sprite.body.velocity.set(0, 0)
    this.flameGfx.clear()
    this.scene.particles.explode(this.sprite.x, this.sprite.y)
    this.sprite.setAlpha(0)
    this.scene.time.delayedCall(1200, () => this.scene.endGame('crash'))
  }

  land() {
    if (this.landed || this.dead) return
    this.landed = true
    AudioSystem.stopThrust()
    this.flameGfx.clear()
    this.sprite.body.velocity.set(0, 0)
    this.scene.particles.landingSparkle(this.sprite.x, this.sprite.y)
    this.scene.time.delayedCall(800, () => this.scene.endGame('safe'))
  }
}

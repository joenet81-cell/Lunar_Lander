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

    // Sprite — scale 0.75 (sprite is 40×52 px, displayed at 30×39 px)
    this.sprite = scene.physics.add.image(x, y, 'ship')
    this.sprite.setScale(0.75)
    this.sprite.setDepth(10)
    this.sprite.body.allowGravity = false

    // Footpads at y=46 of 52px sprite → 20px below center → 20 * 0.75 = 15 world px
    this.hitRadius = 15

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

    // Clamp velocity for arcade feel
    const maxV = 400
    this.sprite.body.velocity.x = Phaser.Math.Clamp(this.sprite.body.velocity.x, -maxV, maxV)
    this.sprite.body.velocity.y = Phaser.Math.Clamp(this.sprite.body.velocity.y, -maxV, maxV)

    // Screen wrap horizontally
    const w = this.scene.scale.width
    if (this.sprite.x < -20) this.sprite.x = w + 20
    if (this.sprite.x > w + 20) this.sprite.x = -20

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

    // Engine bell positions (world px, scale 0.75):
    //   16 sprite px below center → 16 * 0.75 = 12 world px
    //   ±7 sprite px from centerline → 7 * 0.75 ≈ 5 world px
    const BELL_DOWN = 12
    const BELL_SIDE = 5

    // Midpoint on ship's down axis at engine depth
    const midX = this.sprite.x - Math.cos(rad) * BELL_DOWN
    const midY = this.sprite.y - Math.sin(rad) * BELL_DOWN

    // Left and right engine origins
    const engines = [
      { ox: midX - Math.cos(perpRad) * BELL_SIDE, oy: midY - Math.sin(perpRad) * BELL_SIDE },
      { ox: midX + Math.cos(perpRad) * BELL_SIDE, oy: midY + Math.sin(perpRad) * BELL_SIDE }
    ]

    // Flame layers (white core → yellow → orange → red, smaller than single-engine)
    const layers = [
      { color: 0xffffff, w: 2,  alpha: 1.0  },
      { color: 0xffff44, w: 3.5, alpha: 0.9  },
      { color: 0xff8800, w: 5,  alpha: 0.75 },
      { color: 0xff3300, w: 6.5, alpha: 0.5  },
    ]

    for (const { ox, oy } of engines) {
      const flameLen = Phaser.Math.Between(10, 20)
      const tipX = ox - Math.cos(rad) * flameLen
      const tipY = oy - Math.sin(rad) * flameLen

      for (const { color, w, alpha } of layers) {
        const spread = (Math.random() - 0.5) * w * 0.4
        this.flameGfx.fillStyle(color, alpha)
        this.flameGfx.fillTriangle(
          ox + Math.cos(perpRad) * w,
          oy + Math.sin(perpRad) * w,
          ox - Math.cos(perpRad) * w,
          oy - Math.sin(perpRad) * w,
          tipX + Math.cos(perpRad) * spread,
          tipY + Math.sin(perpRad) * spread
        )
      }

      // Bright spark at nozzle exit
      this.flameGfx.fillStyle(0xffffff, 0.9)
      this.flameGfx.fillCircle(ox, oy, 2)
    }
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

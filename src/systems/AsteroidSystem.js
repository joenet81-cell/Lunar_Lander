import Phaser from 'phaser'

/**
 * Moving asteroids that destroy the ship on contact.
 * Higher levels = more asteroids, faster speeds, bigger sizes.
 */
export class AsteroidSystem {
  constructor(scene, levelData, worldWidth, worldHeight) {
    this.scene       = scene
    this.asteroids   = []
    this.gfx         = scene.add.graphics().setDepth(15)
    this.worldWidth  = worldWidth  || scene.scale.width
    this.worldHeight = worldHeight || scene.scale.height

    const count = levelData.asteroids || 0
    if (count === 0) return

    const W  = this.worldWidth
    const WH = this.worldHeight
    const isUp = (levelData.mapDirection === 'up')

    // For 'up' maps: asteroids fill vertically; for 'right': horizontally
    const marginA = W  * 0.12
    const marginB = WH * 0.12

    for (let i = 0; i < count; i++) {
      this._spawnAsteroid(W, WH, marginA, marginB, levelData, isUp)
    }
  }

  _spawnAsteroid(W, WH, marginA, marginB, levelData, isUp) {
    const baseSpeed = 55 + (levelData.asteroids || 1) * 10
    const speed  = Phaser.Math.Between(baseSpeed, baseSpeed + 80)
    const angle  = Math.random() * Math.PI * 2
    const radius = Phaser.Math.Between(13, 26)

    // Spread across the full world dimension
    const x = Phaser.Math.Between(marginA, W - marginA)
    const y = isUp
      ? Phaser.Math.Between(Math.floor(WH * 0.15), Math.floor(WH * 0.85))
      : Phaser.Math.Between(80, WH * 0.65)

    // Build irregular polygon
    const vertCount = Phaser.Math.Between(7, 11)
    const verts = []
    for (let v = 0; v < vertCount; v++) {
      const a = (v / vertCount) * Math.PI * 2
      const r = radius * Phaser.Math.FloatBetween(0.55, 1.25)
      verts.push({ a, r })
    }

    // Random gray-brown tone
    const shade = Phaser.Math.Between(90, 140)
    const color = Phaser.Display.Color.GetColor(shade, shade - 15, shade - 25)

    this.asteroids.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      verts,
      color,
      rotation: 0,
      rotSpeed: Phaser.Math.FloatBetween(-1.2, 1.2)
    })
  }

  update(dt) {
    if (this.asteroids.length === 0) return

    const W   = this.worldWidth
    const WH  = this.worldHeight
    const gfx = this.gfx
    gfx.clear()

    for (const ast of this.asteroids) {
      ast.x        += ast.vx * dt
      ast.y        += ast.vy * dt
      ast.rotation += ast.rotSpeed * dt

      // Wrap within world bounds
      const pad = ast.radius + 10
      if (ast.x < -pad)     ast.x = W  + pad
      if (ast.x > W  + pad) ast.x = -pad
      if (ast.y < -pad)     ast.y = WH + pad
      if (ast.y > WH + pad) ast.y = -pad

      this._drawAsteroid(gfx, ast)
    }
  }

  _drawAsteroid(gfx, ast) {
    // Shadow
    gfx.fillStyle(0x111111, 0.4)
    gfx.fillCircle(ast.x + 3, ast.y + 3, ast.radius)

    // Body fill
    gfx.fillStyle(ast.color)
    gfx.beginPath()
    let first = true
    for (const v of ast.verts) {
      const a  = v.a + ast.rotation
      const px = ast.x + Math.cos(a) * v.r
      const py = ast.y + Math.sin(a) * v.r
      if (first) { gfx.moveTo(px, py); first = false }
      else gfx.lineTo(px, py)
    }
    gfx.closePath()
    gfx.fillPath()

    // Dark outline
    gfx.lineStyle(1.5, 0x332211, 0.9)
    gfx.beginPath()
    first = true
    for (const v of ast.verts) {
      const a  = v.a + ast.rotation
      const px = ast.x + Math.cos(a) * v.r
      const py = ast.y + Math.sin(a) * v.r
      if (first) { gfx.moveTo(px, py); first = false }
      else gfx.lineTo(px, py)
    }
    gfx.closePath()
    gfx.strokePath()

    // Highlight spot (top-left)
    gfx.fillStyle(0xffffff, 0.18)
    gfx.fillCircle(
      ast.x - ast.radius * 0.3,
      ast.y - ast.radius * 0.3,
      ast.radius * 0.32
    )

    // Small crater dots
    gfx.fillStyle(0x000000, 0.25)
    gfx.fillCircle(ast.x + ast.radius * 0.2, ast.y + ast.radius * 0.1, ast.radius * 0.18)
    gfx.fillCircle(ast.x - ast.radius * 0.15, ast.y + ast.radius * 0.3, ast.radius * 0.12)
  }

  checkCollision(ship) {
    if (ship.dead || ship.landed || ship.parked) return false

    const sx = ship.x
    const sy = ship.y

    for (const ast of this.asteroids) {
      const dx   = sx - ast.x
      const dy   = sy - ast.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < ast.radius + 14) return true
    }
    return false
  }
}

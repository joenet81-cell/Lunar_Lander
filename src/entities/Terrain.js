import Phaser from 'phaser'

const SAFE_SPEED  = 1.5   // m/s equivalent
const SAFE_ANGLE  = 20    // degrees

export class Terrain {
  constructor(scene, levelData) {
    this.scene = scene
    this.levelData = levelData
    this.landingPads = []

    const { width, height } = scene.scale
    this.points = this._generatePoints(width, height, levelData)
    this.graphics = scene.add.graphics().setDepth(5)
    this._draw()
    this._buildCollisionRects(height)
  }

  _generatePoints(width, height, levelData) {
    const segments = levelData.terrainSegments || 14
    const roughness = levelData.roughness || 60
    const padCount = levelData.pads || 1
    const baseY = height - levelData.groundHeight || height - 80

    const totalX = width
    const dx = totalX / segments
    const points = []

    // Place landing pads at fixed positions
    const padPositions = []
    for (let p = 0; p < padCount; p++) {
      const padSeg = Math.floor((segments / (padCount + 1)) * (p + 1))
      padPositions.push(padSeg)
    }

    for (let i = 0; i <= segments; i++) {
      const x = i * dx
      const isPad = padPositions.includes(i)
      const isPadEnd = padPositions.includes(i - 1)

      let y
      if (isPad) {
        // Flat segment start — remember it
        y = Phaser.Math.Between(baseY - roughness / 2, baseY + roughness / 2)
        this.landingPads.push({ startX: x, y, index: i })
      } else if (isPadEnd) {
        // Flat continuation from previous pad
        const pad = this.landingPads[this.landingPads.length - 1]
        y = pad.y
        pad.endX = x
      } else {
        y = baseY + Phaser.Math.Between(-roughness, roughness)
      }

      points.push({ x, y })
    }

    // Ensure pads have endX
    this.landingPads = this.landingPads.filter(p => p.endX !== undefined)

    return points
  }

  _draw() {
    const { width, height } = this.scene.scale
    const gfx = this.graphics

    // Terrain fill (dark rock)
    gfx.fillStyle(0x221133)
    gfx.beginPath()
    gfx.moveTo(0, height)
    this.points.forEach(p => gfx.lineTo(p.x, p.y))
    gfx.lineTo(width, height)
    gfx.closePath()
    gfx.fillPath()

    // Terrain outline (bright edge)
    gfx.lineStyle(3, 0x8844cc, 1)
    gfx.beginPath()
    gfx.moveTo(this.points[0].x, this.points[0].y)
    this.points.forEach(p => gfx.lineTo(p.x, p.y))
    gfx.strokePath()

    // Landing pads
    this.landingPads.forEach(pad => {
      // Pad platform
      gfx.fillStyle(0x00ff88)
      gfx.fillRect(pad.startX, pad.y - 4, pad.endX - pad.startX, 4)

      // Pad lights
      const midX = (pad.startX + pad.endX) / 2
      for (let lx = pad.startX + 8; lx < pad.endX; lx += 12) {
        gfx.fillStyle(0xffff00)
        gfx.fillRect(lx - 1, pad.y - 6, 2, 3)
      }

      // Pad label
      const padW = pad.endX - pad.startX
      const midPadX = pad.startX + padW / 2

      const label = this.scene.add.text(midPadX, pad.y - 18, '▼ LAND HERE ▼', {
        fontFamily: 'monospace', fontSize: '10px', color: '#00ff88'
      }).setOrigin(0.5, 1).setDepth(6)

      this.scene.tweens.add({
        targets: label, alpha: 0.3, duration: 600, yoyo: true, repeat: -1
      })
    })
  }

  _buildCollisionRects(height) {
    // Store segment line data for manual collision detection
    this.segments = []
    for (let i = 0; i < this.points.length - 1; i++) {
      this.segments.push({
        x1: this.points[i].x,
        y1: this.points[i].y,
        x2: this.points[i + 1].x,
        y2: this.points[i + 1].y
      })
    }
  }

  checkLanding(ship) {
    if (ship.dead || ship.landed) return

    const sx = ship.x
    const sy = ship.y
    // Use ship's own hitRadius (visual half-height at current scale)
    const hitRadius = ship.hitRadius || 11

    // Find terrain Y at ship's X
    let terrainY = null
    for (const seg of this.segments) {
      if (sx >= seg.x1 && sx <= seg.x2) {
        const t = (sx - seg.x1) / (seg.x2 - seg.x1)
        terrainY = seg.y1 + t * (seg.y2 - seg.y1)
        break
      }
    }

    if (terrainY === null) return
    if (sy + hitRadius < terrainY) return   // still airborne

    // Snap ship to terrain surface so it never appears buried
    ship.sprite.y = terrainY - hitRadius

    // Collision!
    const vx = ship.body.velocity.x / 100
    const vy = ship.body.velocity.y / 100
    const speed = Math.sqrt(vx * vx + vy * vy)
    const angle = Math.abs(Phaser.Math.Angle.WrapDegrees(ship.angle))

    ship.landingSpeed = speed
    ship.landingAngle = angle

    // Check if on a pad
    const onPad = this.landingPads.some(p => sx >= p.startX && sx <= p.endX && Math.abs(terrainY - p.y) < 6)

    if (onPad && speed < SAFE_SPEED && angle < SAFE_ANGLE) {
      ship.land()
    } else {
      ship.kill()
    }
  }
}

import Phaser from 'phaser'

const SAFE_SPEED = 1.5
const SAFE_ANGLE = 20

export class Terrain {
  constructor(scene, levelData, worldWidth, worldHeight) {
    this.scene        = scene
    this.levelData    = levelData
    this.landingPads  = []
    this.launchPad    = null
    this.landingPad   = null
    this.mapDirection = levelData.mapDirection || 'right'

    const { width, height } = scene.scale
    const W  = worldWidth  || width
    const WH = worldHeight || height

    this.graphics = scene.add.graphics().setDepth(5)

    if (this.mapDirection === 'up') {
      this._buildUpMap(width, WH, levelData)
    } else {
      this._buildRightMap(W, WH, levelData)
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  RIGHT MAP  (world wider than screen)
  // ═══════════════════════════════════════════════════════════

  _buildRightMap(W, H, levelData) {
    const roughness = levelData.roughness || 60
    const segments  = levelData.terrainSegments || 14
    const groundY   = H - (levelData.groundHeight || 80)
    const padW      = levelData.padWidth || Math.max(56, Math.floor(W * 0.08))
    const variance  = Math.floor(roughness * 0.3)

    this.launchPad  = { startX: 0, endX: padW, y: groundY }
    const landingY  = groundY + Phaser.Math.Between(-variance, variance)
    this.landingPad = { startX: W - padW, endX: W, y: landingY, floating: false }
    this.landingPads = [this.landingPad]

    const points = [
      { x: 0,    y: groundY },
      { x: padW, y: groundY }
    ]
    const midSegs = Math.max(4, segments - 2)
    for (let i = 1; i <= midSegs; i++) {
      points.push({
        x: padW + ((W - padW * 2) * i / midSegs),
        y: groundY + Phaser.Math.Between(-roughness, roughness)
      })
    }
    points.push({ x: W - padW, y: landingY })
    points.push({ x: W,        y: landingY })

    this.points = points
    this._buildCollisionRects()

    const gfx = this.graphics
    // Fill
    gfx.fillStyle(0x221133)
    gfx.beginPath()
    gfx.moveTo(0, H)
    points.forEach(p => gfx.lineTo(p.x, p.y))
    gfx.lineTo(W, H)
    gfx.closePath()
    gfx.fillPath()
    // Edge
    gfx.lineStyle(3, 0x8844cc, 1)
    gfx.beginPath()
    points.forEach((p, i) => i === 0 ? gfx.moveTo(p.x, p.y) : gfx.lineTo(p.x, p.y))
    gfx.strokePath()

    this._drawLaunchBase(gfx, this.launchPad, H)
    this._drawLandingBase(gfx, this.landingPad, H)
  }

  // ═══════════════════════════════════════════════════════════
  //  UP MAP  (world taller than screen)
  // ═══════════════════════════════════════════════════════════

  _buildUpMap(W, WH, levelData) {
    const roughness = levelData.roughness || 60
    const segments  = levelData.terrainSegments || 14
    const groundY   = WH - (levelData.groundHeight || 80)
    const padW      = levelData.padWidth || Math.max(56, Math.floor(W * 0.1))
    const cx        = W / 2

    // Launch pad — centered on floor
    this.launchPad = { startX: cx - padW / 2, endX: cx + padW / 2, y: groundY }

    // Landing platform — not too close to top (min 130px clears the HUD bar),
    // X position randomized so it's not always centered
    const platformY  = Math.max(130, Math.floor(WH * 0.16))
    const padHalfW   = padW / 2
    const padCX      = Phaser.Math.Between(
      Math.ceil(padHalfW + 20),
      Math.floor(W - padHalfW - 20)
    )
    this.landingPad  = { startX: padCX - padHalfW, endX: padCX + padHalfW, y: platformY, floating: true }
    this.landingPads = [this.landingPad]

    // Floor terrain points
    const points = []
    for (let i = 0; i <= segments; i++) {
      const x = (W * i) / segments
      const inLaunch = x >= this.launchPad.startX - 4 && x <= this.launchPad.endX + 4
      points.push({ x, y: inLaunch ? groundY : groundY + Phaser.Math.Between(-roughness / 2, roughness / 2) })
    }
    this.points = points
    this._buildCollisionRects()

    const gfx = this.graphics
    // Fill floor
    gfx.fillStyle(0x221133)
    gfx.beginPath()
    gfx.moveTo(0, WH)
    points.forEach(p => gfx.lineTo(p.x, p.y))
    gfx.lineTo(W, WH)
    gfx.closePath()
    gfx.fillPath()
    // Edge
    gfx.lineStyle(3, 0x8844cc, 1)
    gfx.beginPath()
    points.forEach((p, i) => i === 0 ? gfx.moveTo(p.x, p.y) : gfx.lineTo(p.x, p.y))
    gfx.strokePath()

    this._drawLaunchBase(gfx, this.launchPad, WH)
    this._drawFloatingLandingBase(gfx, this.landingPad, W)
  }

  // ═══════════════════════════════════════════════════════════
  //  BASE DRAWINGS
  // ═══════════════════════════════════════════════════════════

  _drawLaunchBase(gfx, pad, worldH) {
    const { startX, endX, y } = pad
    const w = endX - startX
    gfx.fillStyle(0x226688)
    const legGap = Math.floor(w / 4)
    for (let lx = startX + legGap; lx < endX; lx += legGap) {
      gfx.fillRect(lx - 2, y, 4, worldH - y)
    }
    gfx.fillStyle(0x2277aa)
    gfx.fillRect(startX, y - 6, w, 6)
    gfx.fillStyle(0x33aacc)
    gfx.fillRect(startX, y - 6, w, 2)
    gfx.fillStyle(0x55ddff)
    for (let lx = startX + 10; lx < endX - 10; lx += 20) gfx.fillRect(lx, y - 5, 10, 2)
    gfx.fillStyle(0xffff00)
    for (let lx = startX + 8; lx < endX - 4; lx += 16) {
      gfx.fillRect(lx - 1, y - 10, 2, 5)
      gfx.fillCircle(lx, y - 11, 2)
    }
    const label = this.scene.add.text(startX + w / 2, y - 28, '🚀 LAUNCH BASE',
      { fontFamily: 'monospace', fontSize: '11px', color: '#55ddff' }
    ).setOrigin(0.5, 1).setDepth(6)
    this.scene.tweens.add({ targets: label, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 })
  }

  _drawLandingBase(gfx, pad, worldH) {
    const { startX, endX, y } = pad
    const w = endX - startX
    gfx.fillStyle(0x886622)
    const legGap = Math.floor(w / 4)
    for (let lx = startX + legGap; lx < endX; lx += legGap) {
      gfx.fillRect(lx - 2, y, 4, worldH - y)
    }
    gfx.fillStyle(0xcc7700)
    gfx.fillRect(startX, y - 6, w, 6)
    gfx.fillStyle(0xffaa00)
    gfx.fillRect(startX, y - 6, w, 2)
    gfx.fillStyle(0xffdd44)
    for (let lx = startX + 10; lx < endX - 10; lx += 20) gfx.fillRect(lx, y - 5, 10, 2)
    gfx.fillStyle(0xff8800)
    for (let lx = startX + 8; lx < endX - 4; lx += 16) {
      gfx.fillRect(lx - 1, y - 10, 2, 5)
      gfx.fillCircle(lx, y - 11, 2)
    }
    const label = this.scene.add.text(startX + w / 2, y - 28, '▼ LANDING BASE ▼',
      { fontFamily: 'monospace', fontSize: '11px', color: '#ffaa00' }
    ).setOrigin(0.5, 1).setDepth(6)
    this.scene.tweens.add({ targets: label, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 })
  }

  _drawFloatingLandingBase(gfx, pad, W) {
    const { startX, endX, y } = pad
    const w = endX - startX

    // Hanging support cables from ceiling
    gfx.lineStyle(1, 0x886622, 0.5)
    for (let lx = startX + 8; lx < endX - 4; lx += 16) {
      gfx.beginPath(); gfx.moveTo(lx, 0); gfx.lineTo(lx, y); gfx.strokePath()
    }

    // Platform body
    gfx.fillStyle(0x553300)
    gfx.fillRect(startX - 4, y, w + 8, 14)
    gfx.fillStyle(0xcc7700)
    gfx.fillRect(startX, y, w, 8)
    gfx.fillStyle(0xffaa00)
    gfx.fillRect(startX, y, w, 3)

    // Runway stripes on platform top
    gfx.fillStyle(0xffdd44)
    for (let lx = startX + 8; lx < endX - 8; lx += 16) gfx.fillRect(lx, y + 1, 8, 2)

    // Landing lights (beacons on top of platform)
    gfx.fillStyle(0xff8800)
    for (let lx = startX + 6; lx < endX - 4; lx += 14) {
      gfx.fillRect(lx - 1, y - 5, 2, 6)
      gfx.fillCircle(lx, y - 6, 2)
    }

    // Lateral fins/struts
    gfx.fillStyle(0x886622)
    gfx.fillRect(startX - 8, y + 2, 8, 6)
    gfx.fillRect(endX,       y + 2, 8, 6)

    const label = this.scene.add.text(startX + w / 2, y - 22, '▲ LANDING BASE ▲',
      { fontFamily: 'monospace', fontSize: '11px', color: '#ffaa00' }
    ).setOrigin(0.5, 1).setDepth(6)
    this.scene.tweens.add({ targets: label, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 })
  }

  // ═══════════════════════════════════════════════════════════
  //  COLLISION
  // ═══════════════════════════════════════════════════════════

  _buildCollisionRects() {
    this.segments = []
    for (let i = 0; i < this.points.length - 1; i++) {
      this.segments.push({
        x1: this.points[i].x,     y1: this.points[i].y,
        x2: this.points[i + 1].x, y2: this.points[i + 1].y
      })
    }
  }

  checkLanding(ship) {
    if (ship.dead || ship.landed || ship.parked) return

    const sx = ship.x, sy = ship.y
    const hitRadius = ship.hitRadius || 19

    // ── Floating platform (up maps) ─────────────────────────
    if (this.landingPad && this.landingPad.floating) {
      const lp = this.landingPad
      const onX  = sx >= lp.startX && sx <= lp.endX
      const onY  = sy + hitRadius >= lp.y && sy + hitRadius <= lp.y + 18
      if (onX && onY) {
        ship.sprite.y = lp.y - hitRadius
        const vx = ship.body.velocity.x / 100
        const vy = ship.body.velocity.y / 100
        const speed = Math.sqrt(vx * vx + vy * vy)
        const angle = Math.abs(Phaser.Math.Angle.WrapDegrees(ship.angle))
        ship.landingSpeed = speed
        ship.landingAngle = angle
        if (speed < SAFE_SPEED && angle < SAFE_ANGLE) ship.land()
        else ship.kill()
        return
      }
    }

    // ── Skip while still over launch pad ────────────────────
    const inLaunchX = this.launchPad &&
      sx >= this.launchPad.startX - 5 && sx <= this.launchPad.endX + 5
    if (inLaunchX) {
      if (this.mapDirection === 'up') {
        // Only skip while close to the floor launch area
        if (sy + hitRadius >= this.launchPad.y - 30) return
      } else {
        return
      }
    }

    // ── Floor terrain ────────────────────────────────────────
    let terrainY = null
    for (const seg of this.segments) {
      if (sx >= seg.x1 && sx <= seg.x2) {
        const t = (sx - seg.x1) / (seg.x2 - seg.x1)
        terrainY = seg.y1 + t * (seg.y2 - seg.y1)
        break
      }
    }
    if (terrainY === null) return
    if (sy + hitRadius < terrainY) return

    ship.sprite.y = terrainY - hitRadius

    const vx    = ship.body.velocity.x / 100
    const vy    = ship.body.velocity.y / 100
    const speed = Math.sqrt(vx * vx + vy * vy)
    const angle = Math.abs(Phaser.Math.Angle.WrapDegrees(ship.angle))
    ship.landingSpeed = speed
    ship.landingAngle = angle

    // For 'up' maps landing on floor is always a crash
    const onPad = this.mapDirection !== 'up' && this.landingPads.some(
      p => !p.floating && sx >= p.startX && sx <= p.endX && Math.abs(terrainY - p.y) < 6
    )
    if (onPad && speed < SAFE_SPEED && angle < SAFE_ANGLE) ship.land()
    else ship.kill()
  }
}

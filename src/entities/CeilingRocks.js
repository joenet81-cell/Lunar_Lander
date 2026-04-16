import Phaser from 'phaser'

/**
 * Stalactites hanging from the ceiling.
 * Placed only in the middle section (not over bases).
 * Collision kills the ship on contact.
 */
export class CeilingRocks {
  constructor(scene, levelData, worldWidth, landingPad) {
    this.scene = scene
    this.rocks = []

    const count = levelData.ceilingRocks || 0
    if (count === 0) return

    const W      = worldWidth || scene.scale.width
    const { height } = scene.scale
    const isUp   = levelData.mapDirection === 'up'
    const gfx    = scene.add.graphics().setDepth(8)

    // For 'right' maps: avoid launch (left 12%) and landing (right 12%) zones
    // For 'up' maps: use smaller horizontal margins — hazards start closer to edges
    const marginL = W * (isUp ? 0.06 : 0.12)
    const marginR = W * (isUp ? 0.06 : 0.12)
    const safeW   = W - marginL - marginR
    const slotW   = safeW / count

    // Global height cap for 'up' maps: keep rocks well above the landing platform
    const globalMaxH = isUp && landingPad
      ? landingPad.y - 50          // 50px clearance above platform surface
      : Math.min(160, height * 0.32)

    for (let i = 0; i < count; i++) {
      const cx = marginL + slotW * i + Phaser.Math.Between(
        Math.ceil(slotW * 0.1),
        Math.floor(slotW * 0.9)
      )
      const w = Phaser.Math.Between(35, 75)

      // Extra height reduction for rocks whose X overlaps the landing pad zone
      let maxH = globalMaxH
      if (isUp && landingPad) {
        const padMargin = 30
        const overlapsPad = cx + w / 2 > landingPad.startX - padMargin &&
                            cx - w / 2 < landingPad.endX   + padMargin
        if (overlapsPad) maxH = Math.min(maxH, landingPad.y - 80)
      }

      const minH = 45
      const h = Phaser.Math.Between(minH, Math.max(minH, Math.floor(maxH)))

      this.rocks.push({ x: cx, w, h })
      this._drawStalactite(gfx, cx, w, h)
    }
  }

  _drawStalactite(gfx, cx, w, h) {
    // Build an irregular stalactite from 3 overlapping triangles
    const col1 = 0x4a3355
    const col2 = 0x6a4477
    const col3 = 0x332244
    const highlight = 0x8855aa

    // Base block at ceiling
    gfx.fillStyle(col1)
    gfx.fillRect(cx - w / 2, 0, w, 12)

    // Main body triangle
    gfx.fillStyle(col1)
    gfx.fillTriangle(cx - w / 2, 0, cx + w / 2, 0, cx, h)

    // Left darker facet
    gfx.fillStyle(col3)
    gfx.fillTriangle(cx, 0, cx + w / 2, 0, cx, h)

    // Inner highlight facet (left edge)
    gfx.fillStyle(col2)
    gfx.fillTriangle(cx - w / 2, 0, cx - w / 4, 0, cx, h * 0.55)

    // Small secondary spike (right offset)
    const sx = cx + w * 0.2
    const sw = w * 0.35
    const sh = h * 0.6
    gfx.fillStyle(col1)
    gfx.fillTriangle(sx - sw / 2, 0, sx + sw / 2, 0, sx, sh)

    // Bright edge line
    gfx.lineStyle(1, highlight, 0.6)
    gfx.beginPath()
    gfx.moveTo(cx - w / 2, 0)
    gfx.lineTo(cx, h)
    gfx.strokePath()

    // Dark outline
    gfx.lineStyle(1, 0x221133, 0.8)
    gfx.beginPath()
    gfx.moveTo(cx - w / 2, 0)
    gfx.lineTo(cx + w / 2, 0)
    gfx.lineTo(cx, h)
    gfx.closePath()
    gfx.strokePath()
  }

  checkCollision(ship) {
    if (ship.dead || ship.landed) return false

    const sx = ship.x
    const sy = ship.y - ship.hitRadius  // top of ship

    for (const rock of this.rocks) {
      // Check horizontal overlap
      if (sx < rock.x - rock.w / 2 - 6 || sx > rock.x + rock.w / 2 + 6) continue

      // Interpolate triangle depth at ship X: full height at center, 0 at edges
      const t = Math.min(1, Math.abs(sx - rock.x) / (rock.w / 2))
      const rockBottom = rock.h * (1 - t * t)  // quadratic falloff for pointy tip

      if (sy < rockBottom) return true
    }
    return false
  }
}

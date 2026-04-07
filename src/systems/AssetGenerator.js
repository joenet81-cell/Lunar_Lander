/**
 * Generates all pixel-art assets programmatically — Apollo Lunar Module style.
 * Sprite: 40×52 px (8px of head-room above for the triangle marker).
 * Two side engine bells. Triangle marker with red tip on top.
 */
export function generateAssets(scene) {
  generateShip(scene)
}

function generateShip(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false })
  const W = 40
  const H = 52   // 8px extra at top for triangle

  // All Y coordinates shifted +8 vs previous version to make room above.

  // ── TRIANGULAR MARKER — matches ascent stage width, all red ─
  // Base: x=12–28 (same as ascent stage top), peak: y=0 → 12px tall, pointy
  g.fillStyle(0xff2200)
  g.fillTriangle(12, 12, 28, 12, 20, 0)
  // Dark red outline for pixel definition
  g.lineStyle(1, 0x880000, 1)
  g.beginPath()
  g.moveTo(12, 12)
  g.lineTo(28, 12)
  g.lineTo(20, 0)
  g.closePath()
  g.strokePath()

  // ── LANDING LEGS ─────────────────────────────────────────
  g.fillStyle(0x9999aa)
  g.fillRect(5,  30, 7, 2)
  g.fillRect(3,  32, 6, 2)
  g.fillRect(1,  34, 5, 2)
  g.fillRect(0,  36, 3, 9)
  g.fillStyle(0x777788)
  g.fillRect(4,  32, 1, 7)
  g.fillStyle(0xbbbbcc)
  g.fillRect(0,  45, 10, 3)

  g.fillStyle(0x9999aa)
  g.fillRect(28, 30, 7, 2)
  g.fillRect(31, 32, 6, 2)
  g.fillRect(34, 34, 5, 2)
  g.fillRect(37, 36, 3, 9)
  g.fillStyle(0x777788)
  g.fillRect(35, 32, 1, 7)
  g.fillStyle(0xbbbbcc)
  g.fillRect(30, 45, 10, 3)

  // ── DESCENT STAGE (gold Mylar foil) ──────────────────────
  g.fillStyle(0xcc9922)
  g.fillRect(6, 28, 28, 10)
  g.fillStyle(0x996611)
  for (let x = 8; x < 34; x += 4) g.fillRect(x, 28, 1, 10)
  g.fillStyle(0xaa7711)
  g.fillRect(6,  29, 4, 5)
  g.fillRect(30, 29, 4, 5)
  g.fillStyle(0xddaa33)
  g.fillRect(6,  29, 1, 5)

  // ── TWO ENGINE BELLS ──────────────────────────────────────
  // Left
  g.fillStyle(0x888899)
  g.fillRect(9,  38, 8, 4)
  g.fillStyle(0x777788)
  g.fillRect(8,  42, 10, 2)
  g.fillStyle(0x666677)
  g.fillRect(7,  44, 12, 2)
  g.fillStyle(0x111122)
  g.fillRect(10, 38, 6, 8)
  // Right
  g.fillStyle(0x888899)
  g.fillRect(23, 38, 8, 4)
  g.fillStyle(0x777788)
  g.fillRect(22, 42, 10, 2)
  g.fillStyle(0x666677)
  g.fillRect(21, 44, 12, 2)
  g.fillStyle(0x111122)
  g.fillRect(24, 38, 6, 8)
  // Center strut
  g.fillStyle(0x888899)
  g.fillRect(18, 38, 4, 4)
  g.fillStyle(0x666677)
  g.fillRect(17, 42, 6, 2)

  // ── ASCENT STAGE ─────────────────────────────────────────
  g.fillStyle(0x667766)
  g.fillRect(12, 12, 16, 17)
  g.fillStyle(0x556655)
  g.fillRect(10, 16, 2, 8)
  g.fillRect(28, 16, 2, 8)
  g.fillStyle(0x99aa99)
  g.fillRect(12, 12, 16,  2)
  g.fillRect(12, 12,  2, 17)

  // ── WINDOWS ───────────────────────────────────────────────
  g.fillStyle(0x1155aa)
  g.fillRect(14, 16, 4, 4)
  g.fillRect(22, 16, 4, 4)
  g.fillStyle(0x66aaff)
  g.fillRect(14, 16, 2, 2)
  g.fillRect(22, 16, 2, 2)
  g.fillStyle(0x334433)
  g.fillRect(13, 15,  6,  1)
  g.fillRect(13, 20,  6,  1)
  g.fillRect(13, 15,  1,  6)
  g.fillRect(18, 15,  1,  6)
  g.fillRect(21, 15,  6,  1)
  g.fillRect(21, 20,  6,  1)
  g.fillRect(21, 15,  1,  6)
  g.fillRect(26, 15,  1,  6)

  // ── HATCH ─────────────────────────────────────────────────
  g.fillStyle(0x445544)
  g.fillRect(16, 22, 8, 6)
  g.fillStyle(0x334433)
  g.fillRect(17, 23, 6, 4)
  g.fillStyle(0x99aa99)
  g.fillRect(19, 25, 2, 1)

  // ── DOCKING PORT ──────────────────────────────────────────
  g.fillStyle(0x99aa99)
  g.fillRect(17, 10, 6, 3)
  g.fillStyle(0x778877)
  g.fillRect(18,  9, 4, 2)

  // ── ANTENNA ───────────────────────────────────────────────
  g.fillStyle(0xdddddd)
  g.fillRect(27, 11, 1, 6)
  g.fillRect(24, 11, 4, 1)
  g.fillRect(25, 11, 1, 4)
  g.fillStyle(0xffffff)
  g.fillRect(23, 11, 2, 1)

  // ── RCS NOZZLES ───────────────────────────────────────────
  g.fillStyle(0x333344)
  g.fillRect(10, 23, 2, 2)
  g.fillRect(28, 23, 2, 2)

  g.generateTexture('ship', W, H)
  g.destroy()
}

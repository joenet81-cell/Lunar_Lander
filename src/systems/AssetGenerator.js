/**
 * Generates all pixel-art assets — Industrial Mining Ship style.
 * Sprite: 100×120 px, displayed at scale 0.37 (~37×44 px)
 * Wide boxy hull, cargo pods on sides, 3-engine cluster, spread legs, radar dish.
 */
export function generateAssets(scene) {
  generateShip(scene)
}

function generateShip(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false })
  const W = 100
  const H = 120

  // ══════════════════════════════════════════════════════════════
  //  LANDING LEGS  — 2 outer + 2 inner, spread wide
  //  Footpads at y≈112 → 52px below center (60) → 52*0.37≈19 (hitRadius)
  // ══════════════════════════════════════════════════════════════

  // Left outer leg (dark back plane)
  g.fillStyle(0x555555)
  g.fillTriangle(19, 83, 24, 83, 2, 112)
  // Left outer leg (lighter front face)
  g.fillStyle(0x909090)
  g.fillTriangle(22, 83, 25, 86, 5, 111)

  // Left inner leg
  g.fillStyle(0xb0b0b0)
  g.fillTriangle(28, 87, 33, 87, 17, 108)

  // Right outer leg (dark)
  g.fillStyle(0x555555)
  g.fillTriangle(76, 83, 81, 83, 98, 112)
  // Right outer leg (lighter)
  g.fillStyle(0x909090)
  g.fillTriangle(75, 83, 78, 86, 95, 111)

  // Right inner leg
  g.fillStyle(0xb0b0b0)
  g.fillTriangle(67, 87, 72, 87, 83, 108)

  // Footpads
  g.fillStyle(0x5a5a5a)
  g.fillEllipse(6, 112, 22, 6)
  g.fillStyle(0xb8b8b8)
  g.fillEllipse(6, 111, 14, 3)

  g.fillStyle(0x5a5a5a)
  g.fillEllipse(94, 112, 22, 6)
  g.fillStyle(0xb8b8b8)
  g.fillEllipse(94, 111, 14, 3)

  // ══════════════════════════════════════════════════════════════
  //  ENGINE CLUSTER — 3 nozzles
  //  Nozzle tips at y≈106 → 46px below center → 46*0.37≈17 (NOZZLE_DOWN)
  // ══════════════════════════════════════════════════════════════

  // Left nozzle
  g.fillStyle(0x3a3a3a)
  g.fillTriangle(27, 83, 40, 83, 37, 106)
  g.fillStyle(0x1a1a1a)
  g.fillTriangle(29, 83, 38, 83, 35, 106)

  // Center nozzle (widest)
  g.fillStyle(0x2a2a2a)
  g.fillTriangle(40, 83, 60, 83, 57, 106)
  g.fillStyle(0x111111)
  g.fillTriangle(42, 83, 58, 83, 55, 106)

  // Right nozzle
  g.fillStyle(0x3a3a3a)
  g.fillTriangle(60, 83, 73, 83, 70, 106)
  g.fillStyle(0x1a1a1a)
  g.fillTriangle(62, 83, 71, 83, 68, 106)

  // Nozzle rim highlights (idle engine glow base)
  g.fillStyle(0xdddddd)
  g.fillEllipse(33, 83, 13, 3)
  g.fillStyle(0xffffff)
  g.fillEllipse(50, 83, 19, 4)
  g.fillStyle(0xdddddd)
  g.fillEllipse(67, 83, 13, 3)

  // ══════════════════════════════════════════════════════════════
  //  CARGO PODS — boxy side containers with slot panels
  // ══════════════════════════════════════════════════════════════

  // Left pod
  g.fillStyle(0x424242)
  g.fillRect(2, 40, 20, 32)
  g.fillStyle(0x1e1e1e)
  for (let py = 43; py < 70; py += 9) g.fillRect(4, py, 16, 6)
  g.lineStyle(1.5, 0x888888, 1)
  g.strokeRect(2, 40, 20, 32)

  // Right pod
  g.fillStyle(0x424242)
  g.fillRect(78, 40, 20, 32)
  g.fillStyle(0x1e1e1e)
  for (let py = 43; py < 70; py += 9) g.fillRect(80, py, 16, 6)
  g.lineStyle(1.5, 0x888888, 1)
  g.strokeRect(78, 40, 20, 32)

  // Arm connectors
  g.fillStyle(0x555555)
  g.fillRect(22, 50, 8, 5)
  g.fillRect(70, 50, 8, 5)
  g.lineStyle(1, 0x888888, 1)
  g.strokeRect(22, 50, 8, 5)
  g.strokeRect(70, 50, 8, 5)

  // ══════════════════════════════════════════════════════════════
  //  MAIN HULL — wide boxy body, silver/chrome finish
  // ══════════════════════════════════════════════════════════════

  // Base hull
  g.fillStyle(0x888888)
  g.fillRect(22, 17, 56, 68)

  // Metallic reflections — vertical sheen columns
  g.fillStyle(0xb5b5b5)
  g.fillRect(32, 17, 16, 68)   // central bright strip
  g.fillStyle(0x444444)
  g.fillRect(22, 17, 9, 68)    // left edge shadow
  g.fillRect(69, 17, 9, 68)    // right edge shadow

  // ══════════════════════════════════════════════════════════════
  //  COCKPIT WINDOW — dual-pane armored glass
  // ══════════════════════════════════════════════════════════════

  // Armored frame
  g.fillStyle(0x1e1e1e)
  g.fillRect(28, 19, 44, 26)
  g.lineStyle(2, 0xaaaaaa, 1)
  g.strokeRect(28, 19, 44, 26)

  // Glass backing
  g.fillStyle(0x0a1015)
  g.fillRect(30, 21, 40, 22)

  // Left pane
  g.fillStyle(0x0d1820)
  g.fillRect(31, 22, 18, 19)
  g.lineStyle(1, 0x334455, 1)
  g.strokeRect(31, 22, 18, 19)

  // Right pane
  g.fillStyle(0x0d1820)
  g.fillRect(50, 22, 18, 19)
  g.lineStyle(1, 0x334455, 1)
  g.strokeRect(50, 22, 18, 19)

  // Center divider bar
  g.fillStyle(0x556677)
  g.fillRect(48, 21, 3, 22)

  // Glass reflections (small white triangles, top-left of each pane)
  g.fillStyle(0xffffff)
  g.fillTriangle(33, 24, 39, 24, 33, 30)
  g.fillTriangle(52, 24, 58, 24, 52, 30)

  // ══════════════════════════════════════════════════════════════
  //  HULL PANEL SEAMS
  // ══════════════════════════════════════════════════════════════

  g.lineStyle(1, 0x666666, 0.8)
  g.beginPath(); g.moveTo(22, 51); g.lineTo(78, 51); g.strokePath()
  g.lineStyle(1, 0x777777, 0.4)
  g.beginPath(); g.moveTo(50, 17); g.lineTo(50, 85); g.strokePath()

  // ══════════════════════════════════════════════════════════════
  //  WARNING STRIPE BAND — diagonal silver/dark stripes
  // ══════════════════════════════════════════════════════════════

  g.fillStyle(0x3a3a3a)
  g.fillRect(22, 55, 56, 6)

  // Diagonal stripes (parallelograms made of 2 triangles each)
  for (let sx = 24; sx < 84; sx += 8) {
    g.fillStyle(0xcccccc)
    g.fillTriangle(sx, 55, sx + 4, 55, sx - 2, 61)
    g.fillTriangle(sx + 4, 55, sx + 2, 61, sx - 2, 61)
  }
  g.lineStyle(0.5, 0x777777, 0.5)
  g.strokeRect(22, 55, 56, 6)

  // ══════════════════════════════════════════════════════════════
  //  LOGO PLATE — orange "MINING CO." (dots simulating text)
  // ══════════════════════════════════════════════════════════════

  g.fillStyle(0x1a0d00)
  g.fillRect(27, 62, 46, 9)
  g.lineStyle(1, 0xcc5500, 1)
  g.strokeRect(27, 62, 46, 9)

  g.fillStyle(0xff8800)
  const logoDots = [30, 32, 34, 36, 39, 41, 44, 46, 48, 51, 54, 56, 58, 61, 63, 65]
  for (const dx of logoDots) g.fillRect(dx, 64, 1, 4)

  // ══════════════════════════════════════════════════════════════
  //  SIDE THRUSTERS (RCS)
  // ══════════════════════════════════════════════════════════════

  g.fillStyle(0x444444)
  g.fillRect(18, 68, 5, 9)
  g.fillStyle(0xbbbbbb)
  g.fillEllipse(20, 77, 5, 2)

  g.fillStyle(0x444444)
  g.fillRect(77, 68, 5, 9)
  g.fillStyle(0xbbbbbb)
  g.fillEllipse(80, 77, 5, 2)

  // ══════════════════════════════════════════════════════════════
  //  RIVETS — shiny chrome bolts at panel intersections
  // ══════════════════════════════════════════════════════════════

  const rivets = [
    [24, 19], [76, 19],
    [24, 51], [50, 51], [76, 51],
    [24, 83], [50, 83], [76, 83]
  ]
  for (const [rx, ry] of rivets) {
    g.fillStyle(0xcccccc)
    g.fillCircle(rx, ry, 2.5)
    g.fillStyle(0xffffff)
    g.fillCircle(rx - 0.5, ry - 0.5, 1)
  }

  // ══════════════════════════════════════════════════════════════
  //  TOP DOME — sensor housing / bridge
  // ══════════════════════════════════════════════════════════════

  g.fillStyle(0x555555)
  g.fillEllipse(50, 17, 46, 12)
  g.fillStyle(0x333333)
  g.fillEllipse(50, 17, 30, 8)
  // Dome reflection
  g.fillStyle(0x999999)
  g.fillEllipse(44, 15, 18, 5)

  // ══════════════════════════════════════════════════════════════
  //  RADAR DISH & ANTENNA MAST
  // ══════════════════════════════════════════════════════════════

  // Mast
  g.fillStyle(0x777777)
  g.fillRect(48, 5, 4, 12)
  g.fillStyle(0xaaaaaa)
  g.fillRect(49, 5, 2, 12)

  // Dish (parabolic ellipses)
  g.fillStyle(0xdddddd)
  g.fillEllipse(50, 8, 28, 9)
  g.fillStyle(0xbbbbbb)
  g.fillEllipse(50, 9, 22, 6)
  g.fillStyle(0x999999)
  g.fillEllipse(52, 10, 12, 4)

  // Feed horn
  g.fillStyle(0x666666)
  g.fillCircle(50, 6, 3)
  g.fillStyle(0xcccccc)
  g.fillCircle(50, 6, 1.5)

  // Support struts
  g.lineStyle(1, 0xaaaaaa, 0.8)
  g.beginPath(); g.moveTo(37, 12); g.lineTo(49, 6); g.strokePath()
  g.beginPath(); g.moveTo(63, 12); g.lineTo(51, 6); g.strokePath()

  g.generateTexture('ship', W, H)
  g.destroy()
}

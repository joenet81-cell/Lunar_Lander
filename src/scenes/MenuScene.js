import Phaser from 'phaser'
import { AudioSystem } from '../systems/AudioSystem.js'

// ── Asteroid polygon shapes (relative points, unit scale) ─────────────────
const ASTEROID_SHAPES = [
  [[-1,-0.4],[-0.6,-1],[0.2,-0.9],[0.9,-0.5],[1,0.2],[0.6,0.9],[-0.3,1],[-1,0.4]],
  [[-0.8,-0.5],[-0.3,-1],[0.5,-0.8],[1,-0.2],[0.8,0.6],[0.1,1],[-0.7,0.7],[-1,0]],
  [[-0.5,-1],[0.4,-0.9],[1,-0.3],[0.9,0.5],[0.3,1],[-0.6,0.8],[-1,0.1],[-0.8,-0.5]],
]

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene') }

  create() {
    const { width, height } = this.scale

    // ── LAYERS (depth order) ──────────────────────────────────
    // 0-1: stars    2-3: asteroids    4: comets    5+: UI

    // ── STARS with parallax movement ──────────────────────────
    this.stars = []
    for (let i = 0; i < 200; i++) {
      const size  = Phaser.Math.Between(1, 3)
      const speed = size * 0.25 + Math.random() * 0.3
      const star  = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        size, size, 0xffffff
      ).setDepth(1)
      star.alpha        = Phaser.Math.FloatBetween(0.15, 0.9)
      star.speed        = speed
      star.baseAlpha    = star.alpha
      star.twinkleTimer = Math.random() * 1500
      this.stars.push(star)
    }

    // ── ASTEROIDS ─────────────────────────────────────────────
    this.asteroids = []
    for (let i = 0; i < 6; i++) {
      this._spawnAsteroid(width, height, true)
    }

    // ── EVENT TIMERS ──────────────────────────────────────────
    this.shootingStarTimer  = Phaser.Math.Between(800, 2500)
    this.cometTimer         = Phaser.Math.Between(5000, 12000)
    this.flameTimer         = Phaser.Math.Between(1500, 4000)

    // ── FLAME GFX for menu ship ────────────────────────────────
    this.flameGfx = this.add.graphics().setDepth(6)
    this.flameActive  = false
    this.flameDuration = 0

    // ── TITLE — animated per-letter ───────────────────────────
    this.titleLetters = []
    this._buildTitle(width, height)

    // ── MODULE DISPLAY ─────────────────────────────────────────
    this.moduleImg = this.add.image(width / 2, height * 0.56, 'ship')
      .setScale(1).setDepth(5)

    this.tweens.add({
      targets: this.moduleImg,
      angle: { from: -4, to: 4 },
      y: { from: height * 0.555, to: height * 0.565 },
      duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    })

    // ── UI TEXT ───────────────────────────────────────────────
    const startText = this.add.text(width / 2, height * 0.73, '[ PRESS SPACE TO START ]', {
      fontFamily: 'monospace', fontSize: '18px', color: '#00ff88'
    }).setOrigin(0.5).setDepth(5)

    this.tweens.add({ targets: startText, alpha: 0, duration: 600, yoyo: true, repeat: -1 })

    this.add.text(width / 2, height * 0.84, 'CONTROLS: ← → ROTATE  |  ↑ THRUST  |  ESC PAUSE', {
      fontFamily: 'monospace', fontSize: '11px', color: '#888888'
    }).setOrigin(0.5).setDepth(5)

    const lbText = this.add.text(width / 2, height * 0.92, '[ L ] LEADERBOARD', {
      fontFamily: 'monospace', fontSize: '13px', color: '#8888ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(5)

    lbText.on('pointerover', () => lbText.setColor('#ffffff'))
    lbText.on('pointerout',  () => lbText.setColor('#8888ff'))
    lbText.on('pointerdown', () => this.scene.start('LeaderboardScene'))

    this.input.keyboard.on('keydown-SPACE', () => {
      AudioSystem.init()
      this.scene.start('GameScene', { level: 1 })
    })
    this.input.keyboard.on('keydown-L', () => this.scene.start('LeaderboardScene'))
  }

  update(time, delta) {
    const { width, height } = this.scale

    // ── Animated title letters ────────────────────────────────
    const t = time * 0.001
    for (const letter of this.titleLetters) {
      // Rainbow color — each letter offset in hue
      const hue = ((t * 0.18 + letter._phase * 0.16) % 1 + 1) % 1
      letter.setColor(this._hslToHex(hue, 1, 0.62))

      // Contrasting stroke color (complementary hue)
      const strokeHue = (hue + 0.5) % 1
      letter.setStroke(this._hslToHex(strokeHue, 1, 0.35), 5)

      // Vertical sine wave
      letter.y = letter._baseY + Math.sin(t * 2.2 + letter._phase) * 7

      // Subtle scale pulse
      const s = 1 + Math.sin(t * 3.1 + letter._phase + 1) * 0.06
      letter.setScale(s)
    }

    // ── Stars ─────────────────────────────────────────────────
    for (const star of this.stars) {
      star.y += star.speed * delta * 0.06
      if (star.y > height + 4) {
        star.y = -4
        star.x = Phaser.Math.Between(0, width)
      }
      star.twinkleTimer += delta
      if (star.twinkleTimer > 600 + Math.random() * 1200) {
        star.twinkleTimer = 0
        this.tweens.add({
          targets: star,
          alpha: Phaser.Math.FloatBetween(0.05, star.baseAlpha),
          duration: 200 + Math.random() * 400, yoyo: true
        })
      }
    }

    // ── Asteroids ─────────────────────────────────────────────
    for (const ast of this.asteroids) {
      ast.x  += ast.vx * delta * 0.001
      ast.y  += ast.vy * delta * 0.001
      ast.rot += ast.rotSpeed * delta * 0.001
      this._drawAsteroid(ast)

      // Respawn when off-screen
      if (ast.x < -ast.r - 20 || ast.x > width + ast.r + 20 ||
          ast.y < -ast.r - 20 || ast.y > height + ast.r + 20) {
        this._resetAsteroid(ast, width, height)
      }
    }

    // ── Shooting stars ────────────────────────────────────────
    this.shootingStarTimer -= delta
    if (this.shootingStarTimer <= 0) {
      this.shootingStarTimer = Phaser.Math.Between(1500, 4000)
      this._spawnShootingStar(width, height)
    }

    // ── Comets ────────────────────────────────────────────────
    this.cometTimer -= delta
    if (this.cometTimer <= 0) {
      this.cometTimer = Phaser.Math.Between(6000, 14000)
      this._spawnComet(width, height)
    }

    // ── Ship flame bursts ──────────────────────────────────────
    this.flameTimer -= delta
    if (this.flameTimer <= 0) {
      this.flameActive   = true
      this.flameDuration = Phaser.Math.Between(400, 1200)
      this.flameTimer    = Phaser.Math.Between(2000, 5000)
    }

    if (this.flameActive) {
      this.flameDuration -= delta
      this._drawMenuFlame()
      if (this.flameDuration <= 0) {
        this.flameActive = false
        this.flameGfx.clear()
      }
    }
  }

  // ── Animated title ──────────────────────────────────────────

  _buildTitle(width, height) {
    // Each word is split into individual letter sprites so we can
    // animate color, scale and position independently.
    const words = [
      { text: 'LUNAR',  baseY: height * 0.22 },
      { text: 'LANDER', baseY: height * 0.36 },
    ]

    // Measure one character width using a temporary hidden text
    const probe = this.add.text(0, -999, 'W', {
      fontFamily: 'monospace', fontSize: '64px'
    })
    const charW = probe.width
    probe.destroy()

    let letterIndex = 0
    for (const { text, baseY } of words) {
      const totalW = text.length * charW
      const startX = width / 2 - totalW / 2 + charW / 2

      for (let i = 0; i < text.length; i++) {
        const letter = this.add.text(startX + i * charW, baseY, text[i], {
          fontFamily: 'monospace',
          fontSize: '64px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 5,
        }).setOrigin(0.5).setDepth(5)

        letter._baseY     = baseY
        letter._baseX     = startX + i * charW
        // Each letter gets a unique phase offset for wave & color
        letter._phase     = letterIndex * (Math.PI * 2 / 11)
        this.titleLetters.push(letter)
        letterIndex++
      }
    }
  }

  _hslToHex(h, s, l) {
    // h: 0-1, s: 0-1, l: 0-1  →  '#rrggbb'
    const a = s * Math.min(l, 1 - l)
    const f = n => {
      const k = (n + h * 12) % 12
      const v = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * v).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  // ── Asteroid helpers ────────────────────────────────────────

  _spawnAsteroid(width, height, initial = false) {
    const r     = Phaser.Math.Between(8, 22)
    const shape = Phaser.Utils.Array.GetRandom(ASTEROID_SHAPES)
    const gfx   = this.add.graphics().setDepth(2)

    const ast = {
      gfx, r, shape,
      x: initial ? Phaser.Math.Between(0, width) : -r - 10,
      y: initial ? Phaser.Math.Between(0, height) : Phaser.Math.Between(0, height),
      vx: Phaser.Math.Between(8, 28) * (Math.random() < 0.5 ? 1 : -1),
      vy: Phaser.Math.Between(4, 18),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: Phaser.Math.FloatBetween(-1.2, 1.2),
      color: Phaser.Utils.Array.GetRandom([0x887766, 0x998877, 0x776655, 0xaaa090])
    }
    this._drawAsteroid(ast)
    this.asteroids.push(ast)
    return ast
  }

  _resetAsteroid(ast, width, height) {
    // Re-enter from a random edge
    const edge = Phaser.Math.Between(0, 3)
    if (edge === 0) { ast.x = -ast.r; ast.y = Phaser.Math.Between(0, height); ast.vx = Math.abs(ast.vx) }
    if (edge === 1) { ast.x = width + ast.r; ast.y = Phaser.Math.Between(0, height); ast.vx = -Math.abs(ast.vx) }
    if (edge === 2) { ast.y = -ast.r; ast.x = Phaser.Math.Between(0, width); ast.vy = Math.abs(ast.vy) }
    if (edge === 3) { ast.y = height + ast.r; ast.x = Phaser.Math.Between(0, width); ast.vy = -Math.abs(ast.vy) }
    ast.rot = Math.random() * Math.PI * 2
  }

  _drawAsteroid(ast) {
    const { gfx, r, shape, x, y, rot, color } = ast
    gfx.clear()

    // Shadow/depth layer
    gfx.fillStyle(0x000000, 0.35)
    gfx.beginPath()
    shape.forEach(([px, py], i) => {
      const rx = x + (px * r + 2) * Math.cos(rot) - (py * r + 2) * Math.sin(rot)
      const ry = y + (px * r + 2) * Math.sin(rot) + (py * r + 2) * Math.cos(rot)
      i === 0 ? gfx.moveTo(rx, ry) : gfx.lineTo(rx, ry)
    })
    gfx.closePath()
    gfx.fillPath()

    // Main body
    gfx.fillStyle(color, 0.9)
    gfx.beginPath()
    shape.forEach(([px, py], i) => {
      const rx = x + px * r * Math.cos(rot) - py * r * Math.sin(rot)
      const ry = y + px * r * Math.sin(rot) + py * r * Math.cos(rot)
      i === 0 ? gfx.moveTo(rx, ry) : gfx.lineTo(rx, ry)
    })
    gfx.closePath()
    gfx.fillPath()

    // Highlight (top-left)
    gfx.fillStyle(0xffffff, 0.12)
    gfx.beginPath()
    shape.slice(0, 4).forEach(([px, py], i) => {
      const rx = x + px * r * 0.6 * Math.cos(rot) - py * r * 0.6 * Math.sin(rot)
      const ry = y + px * r * 0.6 * Math.sin(rot) + py * r * 0.6 * Math.cos(rot)
      i === 0 ? gfx.moveTo(rx, ry) : gfx.lineTo(rx, ry)
    })
    gfx.closePath()
    gfx.fillPath()

    // Crater dots
    gfx.fillStyle(0x000000, 0.2)
    gfx.fillCircle(x + r * 0.2, y - r * 0.15, r * 0.18)
    gfx.fillCircle(x - r * 0.3, y + r * 0.25, r * 0.12)
  }

  // ── Shooting star ───────────────────────────────────────────

  _spawnShootingStar(width, height) {
    const x   = Phaser.Math.Between(50, width - 50)
    const y   = Phaser.Math.Between(10, height * 0.5)
    const len = Phaser.Math.Between(50, 120)
    const ang = Phaser.Math.FloatBetween(0.2, 0.5)   // shallow diagonal
    const dir = Math.random() < 0.5 ? 1 : -1
    const gfx = this.add.graphics().setDepth(4)

    // Gradient trail (draw as multiple lines of decreasing alpha)
    for (let i = 0; i < 5; i++) {
      const t = i / 4
      gfx.lineStyle(1, 0xffffff, 0.9 - t * 0.8)
      gfx.beginPath()
      gfx.moveTo(x + dir * len * t,       y + len * ang * t)
      gfx.lineTo(x + dir * len * (t + 0.25), y + len * ang * (t + 0.25))
      gfx.strokePath()
    }
    // Bright head
    gfx.fillStyle(0xffffff, 1)
    gfx.fillRect(x - 1, y - 1, 2, 2)

    const dist = 180
    this.tweens.add({
      targets: gfx,
      x: dir * dist,
      y: dist * ang,
      alpha: 0,
      duration: Phaser.Math.Between(350, 650),
      ease: 'Quad.easeIn',
      onComplete: () => gfx.destroy()
    })
  }

  // ── Comet (slower, bigger, with glowing head + long tail) ──

  _spawnComet(width, height) {
    const startX = Math.random() < 0.5 ? -60 : width + 60
    const startY = Phaser.Math.Between(20, height * 0.45)
    const dir    = startX < 0 ? 1 : -1
    const speed  = Phaser.Math.Between(220, 380)
    const angle  = Phaser.Math.FloatBetween(0.15, 0.35) * (Math.random() < 0.5 ? 1 : -1)

    const gfx = this.add.graphics().setDepth(4)
    let cx = startX
    let cy = startY
    let elapsed = 0
    const duration = (width + 120) / speed * 1000

    const tail = []   // trail positions

    const ticker = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        elapsed += 16
        cx += dir * speed * 0.016
        cy += speed * angle * 0.016
        tail.push({ x: cx, y: cy })
        if (tail.length > 30) tail.shift()

        gfx.clear()
        // Draw tail segments fading out
        tail.forEach((pt, i) => {
          const t = i / tail.length
          const sz = t * 3
          gfx.fillStyle(Phaser.Utils.Array.GetRandom([0x88ccff, 0xaaddff, 0xffffff]), t * 0.6)
          gfx.fillRect(pt.x - sz / 2, pt.y - sz / 2, sz, sz)
        })
        // Glowing head
        gfx.fillStyle(0xffffff, 1)
        gfx.fillCircle(cx, cy, 3)
        gfx.fillStyle(0x88ccff, 0.4)
        gfx.fillCircle(cx, cy, 7)

        if (elapsed >= duration) {
          ticker.remove()
          gfx.destroy()
        }
      }
    })
  }

  // ── Menu ship flame burst ───────────────────────────────────

  _drawMenuFlame() {
    this.flameGfx.clear()
    const ship = this.moduleImg
    const rad     = Phaser.Math.DegToRad(ship.angle - 90)
    const perpRad = rad + Math.PI / 2
    const BELL_DOWN = 16
    const BELL_SIDE = 7

    const midX = ship.x - Math.cos(rad) * BELL_DOWN
    const midY = ship.y - Math.sin(rad) * BELL_DOWN

    const engines = [
      { ox: midX - Math.cos(perpRad) * BELL_SIDE, oy: midY - Math.sin(perpRad) * BELL_SIDE },
      { ox: midX + Math.cos(perpRad) * BELL_SIDE, oy: midY + Math.sin(perpRad) * BELL_SIDE }
    ]

    const layers = [
      { color: 0xffffff, w: 2,   alpha: 1.0  },
      { color: 0xffff44, w: 3.5, alpha: 0.9  },
      { color: 0xff8800, w: 5,   alpha: 0.75 },
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
          ox + Math.cos(perpRad) * w, oy + Math.sin(perpRad) * w,
          ox - Math.cos(perpRad) * w, oy - Math.sin(perpRad) * w,
          tipX + Math.cos(perpRad) * spread, tipY + Math.sin(perpRad) * spread
        )
      }
      this.flameGfx.fillStyle(0xffffff, 0.9)
      this.flameGfx.fillCircle(ox, oy, 2)
    }
  }
}

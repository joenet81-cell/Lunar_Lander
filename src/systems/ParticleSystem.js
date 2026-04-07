import Phaser from 'phaser'

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene
    this.particles = []
    this.gfx = scene.add.graphics().setDepth(20)
  }

  explode(x, y) {
    for (let i = 0; i < 48; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Phaser.Math.Between(40, 220)
      const colors = [0xff4400, 0xff8800, 0xffff00, 0xffffff, 0xff2200]
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: Phaser.Math.FloatBetween(0.8, 1.8),
        size: Phaser.Math.Between(2, 5),
        color: Phaser.Utils.Array.GetRandom(colors),
        type: 'debris'
      })
    }
    // Smoke
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      this.particles.push({
        x: x + Phaser.Math.Between(-8, 8),
        y: y + Phaser.Math.Between(-8, 8),
        vx: Math.cos(angle) * Phaser.Math.Between(10, 60),
        vy: Math.sin(angle) * Phaser.Math.Between(10, 60) - 30,
        life: 1.0,
        decay: 0.5,
        size: Phaser.Math.Between(4, 10),
        color: 0x555555,
        type: 'smoke'
      })
    }
  }

  landingSparkle(x, y) {
    for (let i = 0; i < 24; i++) {
      const angle = -Math.PI + Math.random() * Math.PI   // upper half
      const speed = Phaser.Math.Between(30, 120)
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 1.2,
        size: Phaser.Math.Between(2, 4),
        color: Phaser.Utils.Array.GetRandom([0x00ff88, 0xffff00, 0xffffff]),
        type: 'spark'
      })
    }
  }

  update() {
    const dt = this.scene.game.loop.delta / 1000
    const gfx = this.gfx
    gfx.clear()

    this.particles = this.particles.filter(p => {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 60 * dt   // slight gravity on particles
      p.life -= p.decay * dt

      if (p.life <= 0) return false

      gfx.fillStyle(p.color, p.type === 'smoke' ? p.life * 0.4 : p.life)
      const s = p.size * p.life
      gfx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
      return true
    })
  }
}

import Phaser from 'phaser'

export class HUDScene extends Phaser.Scene {
  constructor() { super('HUDScene') }

  init(data) {
    this.gameScene = data.gameScene
  }

  create() {
    const { width } = this.scale
    const style = { fontFamily: 'monospace', fontSize: '13px', color: '#00ff88' }
    const warnStyle = { ...style, color: '#ff4444' }

    // Panel background
    this.panelBg = this.add.rectangle(0, 0, width, 56, 0x000000, 0.7).setOrigin(0, 0)
    this.add.rectangle(0, 56, width, 2, 0x00ff88, 1).setOrigin(0, 0)

    // Labels
    this.add.text(16, 8, 'FUEL', { ...style, color: '#888888', fontSize: '10px' })
    this.add.text(16, 20, '', style) // spacer
    this.fuelBar = this.add.rectangle(16, 36, 120, 10, 0x00ff88).setOrigin(0, 0.5)
    this.fuelBarBg = this.add.rectangle(16, 36, 120, 10, 0x224422).setOrigin(0, 0.5).setDepth(-1)

    this.add.text(160, 8, 'VEL X', { ...style, color: '#888888', fontSize: '10px' })
    this.velXText = this.add.text(160, 22, '0.00', style)

    this.add.text(240, 8, 'VEL Y', { ...style, color: '#888888', fontSize: '10px' })
    this.velYText = this.add.text(240, 22, '0.00', style)

    this.add.text(320, 8, 'ALT', { ...style, color: '#888888', fontSize: '10px' })
    this.altText = this.add.text(320, 22, '0', style)

    this.add.text(400, 8, 'ANGLE', { ...style, color: '#888888', fontSize: '10px' })
    this.angleText = this.add.text(400, 22, '0°', style)

    this.add.text(480, 8, 'SPEED', { ...style, color: '#888888', fontSize: '10px' })
    this.speedText = this.add.text(480, 22, '0.00', style)

    // Level indicator
    const level = this.gameScene.levelIndex + 1
    this.add.text(width - 16, 8, `LEVEL ${level}`, {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffff00'
    }).setOrigin(1, 0)

    // Warning text
    this.warnText = this.add.text(width / 2, 30, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ff4444'
    }).setOrigin(0.5)

    // Safe landing indicators
    this.add.text(width - 16, 22, 'SAFE: SPD<1.5 | ANG<20°', {
      fontFamily: 'monospace', fontSize: '9px', color: '#446644'
    }).setOrigin(1, 0)
  }

  update() {
    if (!this.gameScene || !this.gameScene.ship) return
    const ship = this.gameScene.ship
    const { width } = this.scale

    const vx = ship.body.velocity.x / 100
    const vy = ship.body.velocity.y / 100
    const speed = Math.sqrt(vx * vx + vy * vy)
    const angle = Phaser.Math.Angle.WrapDegrees(ship.angle)
    const alt = Math.max(0, 600 - ship.y)
    const fuelPct = ship.fuel / ship.maxFuel

    // Fuel bar
    this.fuelBar.width = Math.max(0, 120 * fuelPct)
    const fuelColor = fuelPct > 0.5 ? 0x00ff88 : fuelPct > 0.25 ? 0xffaa00 : 0xff4444
    this.fuelBar.fillColor = fuelColor

    // Values
    const colorOk = '#00ff88'
    const colorWarn = '#ff4444'

    const spdSafe = speed < 1.5
    const angSafe = Math.abs(angle) < 20

    this.velXText.setText(vx.toFixed(2)).setColor(Math.abs(vx) < 1 ? colorOk : colorWarn)
    this.velYText.setText(vy.toFixed(2)).setColor(vy < 1.5 ? colorOk : colorWarn)
    this.altText.setText(Math.round(alt)).setColor(colorOk)
    this.angleText.setText(`${angle.toFixed(1)}°`).setColor(angSafe ? colorOk : colorWarn)
    this.speedText.setText(speed.toFixed(2)).setColor(spdSafe ? colorOk : colorWarn)

    // Warning
    const warnings = []
    if (!spdSafe && alt < 100) warnings.push('! HIGH SPEED !')
    if (!angSafe && alt < 100) warnings.push('! CHECK ANGLE !')
    if (ship.fuel < 50) warnings.push('! LOW FUEL !')
    this.warnText.setText(warnings.join('  '))
  }
}

import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene.js'
import { MenuScene } from './scenes/MenuScene.js'
import { GameScene } from './scenes/GameScene.js'
import { HUDScene } from './scenes/HUDScene.js'
import { ResultScene } from './scenes/ResultScene.js'
import { LeaderboardScene } from './scenes/LeaderboardScene.js'
import { DevScene } from './scenes/DevScene.js'

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, MenuScene, GameScene, HUDScene, ResultScene, LeaderboardScene, DevScene]
}

new Phaser.Game(config)

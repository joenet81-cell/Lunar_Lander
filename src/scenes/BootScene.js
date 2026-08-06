import Phaser from 'phaser'
import { generateAssets } from '../systems/AssetGenerator.js'
import bgNebulaUrl from '../../fondo/3_minimalista.png'

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene') }

  preload() {
    this.load.image('bg_nebula', bgNebulaUrl)
  }

  create() {
    // Make the background smooth instead of pixelated
    this.textures.get('bg_nebula').setFilter(Phaser.Textures.FilterMode.LINEAR)
    
    generateAssets(this)
    this.scene.start('MenuScene')
    this.scene.launch('DevScene')   // persistent overlay, always listening
  }
}

import Phaser from 'phaser'
import { generateAssets } from '../systems/AssetGenerator.js'

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene') }

  create() {
    generateAssets(this)
    this.scene.start('MenuScene')
  }
}

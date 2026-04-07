import Phaser from 'phaser';
import AudioManager from '../systems/AudioManager.js';
import SaveManager from '../systems/SaveManager.js';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.background);

    // Animated water lines in background
    for (let i = 0; i < 5; i++) {
      const y = 400 + i * 40;
      const line = this.add.rectangle(400, y, 800, 2, 0x16213e).setAlpha(0.5);
      this.tweens.add({
        targets: line,
        x: { from: 380, to: 420 },
        duration: 2000 + i * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 120, 'PIRATE\nINVADERS', {
      fontSize: '64px',
      color: '#ffd700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Skull decoration
    this.add.text(GAME_WIDTH / 2, 210, '\u2620', {
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // High score
    const data = SaveManager.load();
    this.add.text(GAME_WIDTH / 2, 270, `HIGH SCORE: ${data.highScore}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Play button
    this.createButton(GAME_WIDTH / 2, 360, 'PLAY', () => {
      AudioManager.playSfx('menuSelect');
      this.scene.start('GameScene');
    });

    // Instructions
    this.add.text(GAME_WIDTH / 2, 480, [
      'ARROWS or A/D to move',
      'SPACE to fire',
      'ESC to pause',
    ].join('\n'), {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'monospace',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 560, 'v1.0 \u2022 Pirate Invaders', {
      fontSize: '12px',
      color: '#555555',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  createButton(x, y, label, callback) {
    const bg = this.add.image(x, y, 'button').setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontSize: '22px',
      color: '#ffd700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setTexture('buttonHover'));
    bg.on('pointerout', () => bg.setTexture('button'));
    bg.on('pointerdown', callback);

    return bg;
  }
}

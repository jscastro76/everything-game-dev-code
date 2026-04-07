import Phaser from 'phaser';
import AudioManager from '../systems/AudioManager.js';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalWave = data.wave || 1;
    this.highScore = data.highScore || 0;
    this.isNewHighScore = data.isNewHighScore || false;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.background);

    // Title
    this.add.text(GAME_WIDTH / 2, 100, 'YE BE SUNK!', {
      fontSize: '48px',
      color: '#e74c3c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 160, '\u2620', {
      fontSize: '40px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Score
    this.add.text(GAME_WIDTH / 2, 230, `SCORE: ${this.finalScore}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 270, `WAVE: ${this.finalWave}`, {
      fontSize: '20px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // High score
    const hsColor = this.isNewHighScore ? '#ffd700' : '#888888';
    const hsPrefix = this.isNewHighScore ? 'NEW HIGH SCORE!' : 'HIGH SCORE:';
    this.add.text(GAME_WIDTH / 2, 320, `${hsPrefix} ${this.highScore}`, {
      fontSize: '22px',
      color: hsColor,
      fontFamily: 'monospace',
      fontStyle: this.isNewHighScore ? 'bold' : 'normal',
    }).setOrigin(0.5);

    if (this.isNewHighScore) {
      const crown = this.add.text(GAME_WIDTH / 2, 355, '\u2605 \u2605 \u2605', {
        fontSize: '24px',
        color: '#ffd700',
      }).setOrigin(0.5);
      this.tweens.add({
        targets: crown,
        alpha: { from: 1, to: 0.4 },
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    }

    // Buttons
    this.createButton(GAME_WIDTH / 2, 420, 'PLAY AGAIN', () => {
      AudioManager.playSfx('menuSelect');
      this.scene.start('GameScene');
    });

    this.createButton(GAME_WIDTH / 2, 490, 'MAIN MENU', () => {
      AudioManager.playSfx('menuSelect');
      this.scene.start('MenuScene');
    });
  }

  createButton(x, y, label, callback) {
    const bg = this.add.image(x, y, 'button').setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontSize: '20px',
      color: '#ffd700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setTexture('buttonHover'));
    bg.on('pointerout', () => bg.setTexture('button'));
    bg.on('pointerdown', callback);
  }
}

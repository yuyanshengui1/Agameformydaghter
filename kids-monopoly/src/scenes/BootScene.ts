import Phaser from 'phaser';

/**
 * Boot 场景 - 加载资源、初始化。
 * 由于使用 emoji + CSS，不需要加载图片资源，直接转场到菜单。
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 使用 emoji 和 CSS 绘制，不需要加载图片资源
    // 可以在这里加载字体或其他资源
  }

  create(): void {
    // 直接转场到菜单场景
    this.scene.start('MenuScene');
  }
}

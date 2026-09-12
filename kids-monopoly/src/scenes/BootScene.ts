import Phaser from 'phaser';
import { ASSET_LIST } from '../config/assets';

/**
 * Boot 场景 - 加载图片资源，初始化后转场到菜单。
 */
export class BootScene extends Phaser.Scene {
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 加载进度提示
    this.progressText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, '加载中... 0%', {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      })
      .setOrigin(0.5);

    // 预加载所有图片资源
    for (const asset of ASSET_LIST) {
      // 防御性过滤：跳过无效的 key/path，避免 Phaser 抛出 "Invalid File key" 错误
      if (!asset?.key || !asset?.path) continue;
      this.load.image(asset.key, asset.path);
    }

    // 进度更新
    this.load.on('progress', (value: number) => {
      const pct = Math.round(value * 100);
      this.progressText.setText(`加载中... ${pct}%`);
    });

    this.load.on('complete', () => {
      this.progressText.setText('加载完成！');
    });
  }

  create(): void {
    // 资源加载完成，转场到菜单场景
    this.scene.start('MenuScene');
  }
}

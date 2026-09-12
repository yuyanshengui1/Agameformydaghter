import './styles/main.css';
import './styles/themes.css';
import './styles/hud.css';

import Phaser from 'phaser';
import { createPhaserConfig, GAME_CONFIG } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

/** 创建 Phaser 游戏实例 */
const config = createPhaserConfig();
config.scene = [BootScene, MenuScene, GameScene];

const game = new Phaser.Game(config);

// 暴露给全局便于调试
(window as unknown as Record<string, unknown>).__GAME__ = game;
(window as unknown as Record<string, unknown>).__CONFIG__ = GAME_CONFIG;

export default game;

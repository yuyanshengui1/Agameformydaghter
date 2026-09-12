import Phaser from 'phaser';

/** 游戏常量 */
export const GAME_CONFIG = {
  /** 画布宽度 */
  WIDTH: 1280,
  /** 画布高度 */
  HEIGHT: 800,
  /** 地块总数 */
  TOTAL_TILES: 44,
  /** 每边地块数（不含角） */
  TILES_PER_SIDE: 10,
  /** 初始金币 */
  INITIAL_COINS: 200,
  /** 经过起点奖励 */
  PASS_START_BONUS: 20,
  /** 落在起点奖励 */
  START_BONUS: 40,
  /** 最大房屋等级 */
  MAX_HOUSE_LEVEL: 3,
  /** AI 思考延迟（毫秒） */
  AI_DELAY: 1200,
  /** 角色移动每格延迟（毫秒） */
  MOVE_STEP_DELAY: 220,
  /** 存档 key */
  SAVE_KEY: 'kids-monopoly-save',
  /** 存档版本 */
  SAVE_VERSION: 1,
} as const;

/** 棋盘布局常量 */
export const BOARD_LAYOUT = {
  /** 棋盘左上角 x */
  BOARD_X: 110,
  /** 棋盘左上角 y */
  BOARD_Y: 110,
  /** 地块尺寸 */
  TILE_SIZE: 85,
  /** 地块间隙 */
  TILE_GAP: 4,
  /** 角落地块尺寸（更大） */
  CORNER_SIZE: 106,
} as const;

/** 角色定义 */
export const CHARACTERS = [
  { id: 'rabbit', name: '小兔子', emoji: '🐰', color: 0xffb6c1 },
  { id: 'fox', name: '小狐狸', emoji: '🦊', color: 0xffa500 },
  { id: 'bear', name: '小熊', emoji: '🐻', color: 0xd2a679 },
  { id: 'cat', name: '小猫咪', emoji: '🐱', color: 0xdda0dd },
] as const;

/** 主题定义 */
export const THEMES = [
  { id: 'ice-castle', name: '冰雪城堡', bodyClass: 'theme-ice-castle' },
  { id: 'garden', name: '花园', bodyClass: 'theme-garden' },
] as const;

/** 创建 Phaser 游戏配置 */
export function createPhaserConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    backgroundColor: 'transparent',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      roundPixels: true,
    },
    scene: [],
  };
}

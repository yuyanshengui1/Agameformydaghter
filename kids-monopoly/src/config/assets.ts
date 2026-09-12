/**
 * 游戏资源注册表
 * 集中管理所有图片资源的 key 与路径，供 BootScene 预加载、GameScene 使用。
 */

/** Phaser 纹理 key 列表 */
export const TEXTURES = {
  // 地块图标
  TILE_START: 'tile-start',
  TILE_MATH: 'tile-math',
  TILE_ENGLISH: 'tile-english',
  TILE_CHINESE: 'tile-chinese',
  TILE_CHANCE: 'tile-chance',
  TILE_TAX: 'tile-tax',
  TILE_REST: 'tile-rest',
  TILE_TREASURE: 'tile-treasure',
  TILE_JAIL: 'tile-jail',
  TILE_PORTAL: 'tile-portal',
  // 角色 token
  CHAR_PINK: 'char-pink',
  CHAR_BLUE: 'char-blue',
  CHAR_VIOLET: 'char-violet',
  CHAR_GREEN: 'char-green',
} as const;

/** Phaser 预加载资源列表 */
export const ASSET_LIST: { key: string; path: string }[] = [
  { key: TEXTURES.TILE_START, path: '/assets/tiles/start.jpg' },
  { key: TEXTURES.TILE_MATH, path: '/assets/tiles/math.jpg' },
  { key: TEXTURES.TILE_ENGLISH, path: '/assets/tiles/english.jpg' },
  { key: TEXTURES.TILE_CHINESE, path: '/assets/tiles/chinese.jpg' },
  { key: TEXTURES.TILE_CHANCE, path: '/assets/tiles/chance.jpg' },
  { key: TEXTURES.TILE_TAX, path: '/assets/tiles/tax.jpg' },
  { key: TEXTURES.TILE_REST, path: '/assets/tiles/rest.jpg' },
  { key: TEXTURES.TILE_TREASURE, path: '/assets/tiles/treasure.jpg' },
  { key: TEXTURES.TILE_JAIL, path: '/assets/tiles/jail.jpg' },
  { key: TEXTURES.TILE_PORTAL, path: '/assets/tiles/portal.jpg' },
  { key: TEXTURES.CHAR_PINK, path: '/assets/characters/pink.jpg' },
  { key: TEXTURES.CHAR_BLUE, path: '/assets/characters/blue.jpg' },
  { key: TEXTURES.CHAR_VIOLET, path: '/assets/characters/violet.jpg' },
  { key: TEXTURES.CHAR_GREEN, path: '/assets/characters/green.jpg' },
];

/** 地块类型 -> 纹理 key 映射 */
export const TILE_TEXTURE_MAP: Record<string, string> = {
  start: TEXTURES.TILE_START,
  math: TEXTURES.TILE_MATH,
  english: TEXTURES.TILE_ENGLISH,
  chinese: TEXTURES.TILE_CHINESE,
  chance: TEXTURES.TILE_CHANCE,
  tax: TEXTURES.TILE_TAX,
  rest: TEXTURES.TILE_REST,
  treasure: TEXTURES.TILE_TREASURE,
  jail: TEXTURES.TILE_JAIL,
  portal: TEXTURES.TILE_PORTAL,
};

/** 角色 id -> 纹理 key 映射 */
export const CHAR_TEXTURE_MAP: Record<string, string> = {
  pink: TEXTURES.CHAR_PINK,
  blue: TEXTURES.CHAR_BLUE,
  violet: TEXTURES.CHAR_VIOLET,
  green: TEXTURES.CHAR_GREEN,
};

/** 骰子图片路径（HTML <img> 使用，不走 Phaser） */
export const DICE_IMAGES: Record<number, string> = {
  1: '/assets/dice/dice-1.jpg',
  2: '/assets/dice/dice-2.jpg',
  3: '/assets/dice/dice-3.jpg',
  4: '/assets/dice/dice-4.jpg',
  5: '/assets/dice/dice-5.jpg',
  6: '/assets/dice/dice-6.jpg',
};

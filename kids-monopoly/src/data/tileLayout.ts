import type { TileType, TileData } from '../types';

/** 地块类型定义：名称 + emoji + 价格 */
interface TileDef {
  type: TileType;
  name: string;
  emoji: string;
  price: number;
}

/**
 * 44 个地块布局。
 * 索引 0 = 起点（左上角），顺时针排列。
 * 四个角：0(起点/左上), 11(右上), 22(右下/监狱), 33(左下)
 * 每边 10 个地块 + 1 个角 = 11，4×11 = 44。
 */
const TILE_DEFS: TileDef[] = [
  // === 顶边（索引 0~11，0=左上角起点，1~10 为顶边，11=右上角）===
  { type: 'start', name: '起点', emoji: '🏁', price: 0 },
  { type: 'math', name: '算术乐园', emoji: '➕', price: 60 },
  { type: 'chance', name: '机会', emoji: '❓', price: 0 },
  { type: 'english', name: '英语花园', emoji: '🔤', price: 60 },
  { type: 'tax', name: '纳税站', emoji: '💰', price: 0 },
  { type: 'rest', name: '休息亭', emoji: '🍵', price: 0 },
  { type: 'math', name: '数字城堡', emoji: '🔢', price: 80 },
  { type: 'chinese', name: '语文长廊', emoji: '📖', price: 80 },
  { type: 'chinese', name: '诗词亭', emoji: '📜', price: 90 },
  { type: 'english', name: '英语小镇', emoji: '🐱', price: 90 },
  { type: 'math', name: '加减王国', emoji: '➖', price: 90 },
  // 11 = 右上角
  { type: 'rest', name: '休息驿站', emoji: '🌟', price: 0 },
  // === 右边（索引 12~22，22=右下角监狱）===
  { type: 'chinese', name: '汉字森林', emoji: '🌳', price: 100 },
  { type: 'math', name: '算术塔', emoji: '🗼', price: 100 },
  { type: 'english', name: '英语峡谷', emoji: '🏞️', price: 110 },
  { type: 'english', name: '英语港口', emoji: '⛵', price: 110 },
  { type: 'treasure', name: '宝藏洞', emoji: '💎', price: 0 },
  { type: 'chinese', name: '成语花园', emoji: '🌸', price: 120 },
  { type: 'english', name: '英语山峰', emoji: '⛰️', price: 120 },
  { type: 'chance', name: '机会', emoji: '❓', price: 0 },
  { type: 'math', name: '数字迷宫', emoji: '🌀', price: 130 },
  { type: 'chinese', name: '诗词阁', emoji: '📜', price: 130 },
  // 22 = 右下角
  { type: 'jail', name: '休息室', emoji: '😴', price: 0 },
  // === 底边（索引 23~33，33=左下角）===
  { type: 'english', name: '英语海滩', emoji: '🏖️', price: 140 },
  { type: 'math', name: '算术桥', emoji: '🌉', price: 140 },
  { type: 'chance', name: '机会', emoji: '❓', price: 0 },
  { type: 'chinese', name: '汉字广场', emoji: '🏛️', price: 150 },
  { type: 'portal', name: '传送门', emoji: '🌀', price: 0 },
  { type: 'english', name: '英语星空', emoji: '✨', price: 160 },
  { type: 'math', name: '数字星河', emoji: '⭐', price: 160 },
  { type: 'math', name: '几何花园', emoji: '📐', price: 160 },
  { type: 'chinese', name: '语文湖畔', emoji: '🏞️', price: 170 },
  { type: 'english', name: '英语彩虹', emoji: '🌈', price: 170 },
  // 33 = 左下角
  { type: 'treasure', name: '宝藏箱', emoji: '🎁', price: 0 },
  // === 左边（索引 34~43，回到 0）===
  { type: 'math', name: '算术森林', emoji: '🌲', price: 180 },
  { type: 'chinese', name: '汉字山', emoji: '⛰️', price: 180 },
  { type: 'chance', name: '机会', emoji: '❓', price: 0 },
  { type: 'english', name: '英语牧场', emoji: '🌾', price: 190 },
  { type: 'tax', name: '纳税所', emoji: '🏦', price: 0 },
  { type: 'rest', name: '休息泉', emoji: '⛲', price: 0 },
  { type: 'math', name: '数字城堡', emoji: '🏰', price: 200 },
  { type: 'chinese', name: '语文星空', emoji: '🌌', price: 200 },
  { type: 'chinese', name: '汉字田野', emoji: '🌾', price: 210 },
  { type: 'english', name: '英语终点', emoji: '🎯', price: 220 },
];

/** 四个角的索引 */
export const CORNER_INDICES = [0, 11, 22, 33];

/** 判断是否为角落地块 */
export function isCorner(index: number): boolean {
  return CORNER_INDICES.includes(index);
}

/** 获取地块所在边：0=顶,1=右,2=底,3=左,-1=角 */
function getSide(index: number): number {
  if (isCorner(index)) return -1;
  if (index >= 1 && index <= 10) return 0; // 顶边
  if (index >= 12 && index <= 21) return 1; // 右边
  if (index >= 23 && index <= 32) return 2; // 底边
  return 3; // 左边 (34~43)
}

/** 初始化所有 44 个地块 */
export function createTiles(): TileData[] {
  return TILE_DEFS.map((def, index) => ({
    index,
    type: def.type,
    name: def.name,
    emoji: def.emoji,
    price: def.price,
    ownerId: null,
    houseLevel: 0,
    side: getSide(index),
  }));
}

/** 可购买的地块类型 */
export const PURCHASABLE_TYPES: TileType[] = ['math', 'english', 'chinese'];

/** 挑战型地块类型 */
export const CHALLENGE_TYPES: TileType[] = ['math', 'english', 'chinese'];

/** 机会卡定义 */
export const CHANCE_CARDS = [
  { description: '🌸 你在花园里找到了金币！获得 25 金币。', type: 'coins' as const, value: 25 },
  { description: '🎁 生日礼物！获得 30 金币。', type: 'coins' as const, value: 30 },
  { description: '🌈 彩虹桥指引你前进 3 格。', type: 'move' as const, value: 3 },
  { description: '⭐ 星星魔法！后退 2 格。', type: 'move' as const, value: -2 },
  { description: '💝 好心人给你 15 金币。', type: 'coins' as const, value: 15 },
  { description: '🏰 传送到起点！', type: 'teleport' as const, value: 0, target: 0 },
  { description: '✨ 传送到宝藏洞！', type: 'teleport' as const, value: 0, target: 33 },
  { description: '🌟 获得 20 金币奖励！', type: 'coins' as const, value: 20 },
  { description: '🦄 独角兽带你去休息驿站！', type: 'teleport' as const, value: 0, target: 11 },
  { description: '🍀 幸运草！前进 2 格。', type: 'move' as const, value: 2 },
];

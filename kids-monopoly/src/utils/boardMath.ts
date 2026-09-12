import { BOARD_LAYOUT } from '../config/gameConfig';
import { CORNER_INDICES } from '../data/tileLayout';

/**
 * 计算地块索引在棋盘上的像素坐标（中心点）。
 * 棋盘为正方形，44 格围一圈。
 * 0 = 左上角（起点），顺时针：
 *   0(角) → 1..10(顶) → 11(角) → 12..21(右) → 22(角) → 23..32(底) → 33(角) → 34..43(左) → 回到 0
 */
export function getTilePosition(index: number): { x: number; y: number } {
  const { BOARD_X, BOARD_Y, TILE_SIZE, TILE_GAP, CORNER_SIZE } = BOARD_LAYOUT;
  const step = TILE_SIZE + TILE_GAP;
  const cornerStep = CORNER_SIZE + TILE_GAP;

  // 一圈总长度 = 4 * cornerStep + 4 * 10 * step
  const sideLength = 10 * step;

  if (index === 0) {
    // 左上角
    return { x: BOARD_X + CORNER_SIZE / 2, y: BOARD_Y + CORNER_SIZE / 2 };
  }
  if (index === 11) {
    // 右上角
    return { x: BOARD_X + CORNER_SIZE + sideLength + CORNER_SIZE / 2, y: BOARD_Y + CORNER_SIZE / 2 };
  }
  if (index === 22) {
    // 右下角
    return {
      x: BOARD_X + CORNER_SIZE + sideLength + CORNER_SIZE / 2,
      y: BOARD_Y + CORNER_SIZE + sideLength + CORNER_SIZE / 2,
    };
  }
  if (index === 33) {
    // 左下角
    return { x: BOARD_X + CORNER_SIZE / 2, y: BOARD_Y + CORNER_SIZE + sideLength + CORNER_SIZE / 2 };
  }

  // 顶边 1..10：从左上角右侧往右
  if (index >= 1 && index <= 10) {
    const i = index - 1;
    return {
      x: BOARD_X + CORNER_SIZE + step / 2 + i * step,
      y: BOARD_Y + CORNER_SIZE / 2,
    };
  }
  // 右边 12..21：从右上角下方往下
  if (index >= 12 && index <= 21) {
    const i = index - 12;
    return {
      x: BOARD_X + CORNER_SIZE + sideLength + CORNER_SIZE / 2,
      y: BOARD_Y + CORNER_SIZE + step / 2 + i * step,
    };
  }
  // 底边 23..32：从右下角左侧往左
  if (index >= 23 && index <= 32) {
    const i = index - 23;
    return {
      x: BOARD_X + CORNER_SIZE + sideLength - step / 2 - i * step,
      y: BOARD_Y + CORNER_SIZE + sideLength + CORNER_SIZE / 2,
    };
  }
  // 左边 34..43：从左下角上方往上
  const i = index - 34;
  return {
    x: BOARD_X + CORNER_SIZE / 2,
    y: BOARD_Y + CORNER_SIZE + sideLength - step / 2 - i * step,
  };
}

/** 计算移动后的位置（支持负数后退） */
export function getNextPosition(currentPos: number, steps: number, totalTiles = 44): number {
  return ((currentPos + steps) % totalTiles + totalTiles) % totalTiles;
}

/** 计算从起点走到某格子是否经过起点（用于奖励判断） */
export function passedStart(from: number, to: number, totalTiles = 44): boolean {
  if (to === from) return false;
  // 正向移动
  if (to > from) {
    // 如果从大索引回到小索引说明绕了一圈
    return false;
  }
  // to < from 说明经过了起点
  return true;
}

/** 获取角色在地块上的偏移位置（多人同格不重叠） */
export function getPlayerOffsetOnTile(playerSlot: number): { dx: number; dy: number } {
  const offsets = [
    { dx: -14, dy: -14 },
    { dx: 14, dy: -14 },
    { dx: -14, dy: 14 },
    { dx: 14, dy: 14 },
  ];
  return offsets[playerSlot % 4];
}

/** 获取角色在棋盘上的像素坐标 */
export function getPlayerPixelPosition(
  tileIndex: number,
  playerSlot: number
): { x: number; y: number } {
  const pos = getTilePosition(tileIndex);
  const offset = getPlayerOffsetOnTile(playerSlot);
  return { x: pos.x + offset.dx, y: pos.y + offset.dy };
}

/** 地块旋转角度（文字朝向棋盘中心） */
export function getTileRotation(side: number): number {
  // side: 0=顶(不转), 1=右(90度), 2=底(180度), 3=左(270度)
  return (side * Math.PI) / 2;
}

/** 角落地块索引 */
export function isCornerIndex(index: number): boolean {
  return CORNER_INDICES.includes(index);
}

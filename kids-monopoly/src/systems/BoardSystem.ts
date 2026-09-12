import type { TileData, TileType } from '../types';
import { GameState } from './GameState';
import { getTilePosition, getPlayerPixelPosition, getTileRotation } from '../utils/boardMath';
import { PURCHASABLE_TYPES, CHALLENGE_TYPES } from '../data/tileLayout';

/**
 * 棋盘系统 - 提供地块坐标和信息查询。
 */
class BoardSystemImpl {
  /** 获取地块像素坐标 */
  getTilePosition(index: number): { x: number; y: number } {
    return getTilePosition(index);
  }

  /** 获取玩家在棋盘上的像素坐标 */
  getPlayerPixelPosition(tileIndex: number, playerSlot: number): { x: number; y: number } {
    return getPlayerPixelPosition(tileIndex, playerSlot);
  }

  /** 获取地块旋转角度 */
  getTileRotation(side: number): number {
    return getTileRotation(side);
  }

  /** 计算移动后位置 */
  getNextPosition(currentPos: number, steps: number): number {
    const total = 44;
    return ((currentPos + steps) % total + total) % total;
  }

  /** 获取地块信息 */
  getTileInfo(index: number): TileData | undefined {
    return GameState.getTile(index);
  }

  /** 判断是否可购买 */
  isPurchasable(type: TileType): boolean {
    return PURCHASABLE_TYPES.includes(type);
  }

  /** 判断是否为挑战型地块 */
  isChallengeTile(type: TileType): boolean {
    return CHALLENGE_TYPES.includes(type);
  }

  /** 获取玩家在当前地块上的 slot 编号（用于多人同格偏移） */
  getPlayerSlot(playerId: string, tileIndex: number): number {
    const state = GameState.getInternalState();
    const playersOnTile = state.players.filter((p) => p.position === tileIndex && !p.isBankrupt);
    const idx = playersOnTile.findIndex((p) => p.id === playerId);
    return idx >= 0 ? idx : 0;
  }
}

export const BoardSystem = new BoardSystemImpl();

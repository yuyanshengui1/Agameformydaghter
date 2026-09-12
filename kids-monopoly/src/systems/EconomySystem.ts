import type { TileData } from '../types';
import { GameState } from './GameState';
import { GAME_CONFIG } from '../config/gameConfig';

export const MAX_HOUSE_LEVEL = GAME_CONFIG.MAX_HOUSE_LEVEL;

/**
 * 经济系统 - 金币、租金、升级费用管理。
 */
class EconomySystemImpl {
  /** 计算租金 = 基础租金 × 2^房屋等级 */
  calculateRent(tile: TileData, houseLevel: number): number {
    if (tile.price === 0) return 0;
    const base = Math.ceil(tile.price / 5);
    return base * Math.pow(2, houseLevel);
  }

  /** 计算升级费用 = 价格 × (0.5 + 0.25 × 当前等级) 向上取整 */
  calculateUpgradeCost(tile: TileData): number {
    if (tile.price === 0) return 0;
    return Math.ceil(tile.price * (0.5 + 0.25 * tile.houseLevel));
  }

  /** 增加金币 */
  addCoins(playerId: string, amount: number): void {
    const player = GameState.getPlayer(playerId);
    if (player) {
      player.coins += amount;
    }
  }

  /** 扣除金币 */
  removeCoins(playerId: string, amount: number): boolean {
    const player = GameState.getPlayer(playerId);
    if (!player) return false;
    player.coins -= amount;
    return true;
  }

  /** 获取金币 */
  getCoins(playerId: string): number {
    return GameState.getPlayer(playerId)?.coins ?? 0;
  }

  /** 判断是否金币足够 */
  hasEnoughCoins(playerId: string, amount: number): boolean {
    return this.getCoins(playerId) >= amount;
  }

  /** 转账：从 from 转给 to */
  transferCoins(fromId: string, toId: string, amount: number): boolean {
    const from = GameState.getPlayer(fromId);
    const to = GameState.getPlayer(toId);
    if (!from || !to) return false;
    from.coins -= amount;
    to.coins += amount;
    return true;
  }

  /** 获取租金表（展示用） */
  getRentTable(tile: TileData): number[] {
    const table: number[] = [];
    for (let level = 0; level <= MAX_HOUSE_LEVEL; level++) {
      table.push(this.calculateRent(tile, level));
    }
    return table;
  }

  /** 获取玩家所有可升级地块 */
  getUpgradeableTiles(playerId: string): TileData[] {
    const state = GameState.getInternalState();
    return state.tiles.filter(
      (t) => t.ownerId === playerId && t.houseLevel < MAX_HOUSE_LEVEL
    );
  }
}

export const EconomySystem = new EconomySystemImpl();

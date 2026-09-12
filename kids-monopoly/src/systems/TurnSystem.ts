import type { PlayerData } from '../types';
import { GameState } from './GameState';

/**
 * 回合系统 - 切换回合、检查破产、判断游戏结束。
 */
class TurnSystemImpl {
  /** 切换到下一个未破产玩家 */
  nextTurn(): PlayerData {
    const state = GameState.getInternalState();
    const totalPlayers = state.players.length;
    let nextIndex = state.currentPlayerIndex;
    let looped = false;

    for (let i = 0; i < totalPlayers; i++) {
      nextIndex = (nextIndex + 1) % totalPlayers;
      const player = state.players[nextIndex];
      if (!player.isBankrupt) {
        // 如果绕回起点（索引递减到递增跨越了），回合数 +1
        if (looped || nextIndex <= state.currentPlayerIndex) {
          state.roundCount++;
        }
        state.currentPlayerIndex = nextIndex;
        return player;
      }
      if (nextIndex === 0) looped = true;
    }

    // 全部破产了（不应发生）
    state.currentPlayerIndex = nextIndex;
    return state.players[nextIndex];
  }

  /** 获取当前玩家 */
  getCurrentPlayer(): PlayerData {
    return GameState.getCurrentPlayer();
  }

  /** 检查玩家是否破产（金币 < 0） */
  checkBankruptcy(playerId: string): boolean {
    const player = GameState.getPlayer(playerId);
    if (!player) return true;
    if (player.coins < 0) {
      player.isBankrupt = true;
      return true;
    }
    return false;
  }

  /** 游戏是否结束（存活玩家 <= 1） */
  isGameOver(): boolean {
    const state = GameState.getInternalState();
    const active = state.players.filter((p) => !p.isBankrupt);
    if (active.length <= 1) {
      state.gameOver = true;
      if (active.length === 1) {
        state.winnerId = active[0].id;
      }
      return true;
    }
    return false;
  }

  /** 获取获胜者 */
  getWinner(): PlayerData | null {
    const state = GameState.getInternalState();
    if (!state.winnerId) return null;
    return state.players.find((p) => p.id === state.winnerId) ?? null;
  }

  /** 获取所有存活玩家 */
  getActivePlayers(): PlayerData[] {
    return GameState.getInternalState().players.filter((p) => !p.isBankrupt);
  }

  /** 获取所有破产玩家 */
  getBankruptPlayers(): PlayerData[] {
    return GameState.getInternalState().players.filter((p) => p.isBankrupt);
  }

  /** 是否轮到某玩家 */
  isPlayerTurn(playerId: string): boolean {
    return GameState.getCurrentPlayer().id === playerId;
  }
}

export const TurnSystem = new TurnSystemImpl();

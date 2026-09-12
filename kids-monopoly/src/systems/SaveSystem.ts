import type { SaveData, GameStateData } from '../types';
import { GameState } from './GameState';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * 存档系统 - 使用 localStorage 保存/加载游戏进度。
 */
class SaveSystemImpl {
  private saveKey = GAME_CONFIG.SAVE_KEY;
  private version = GAME_CONFIG.SAVE_VERSION;

  /** 保存游戏 */
  save(data: SaveData): boolean {
    try {
      data.version = this.version;
      data.timestamp = Date.now();
      localStorage.setItem(this.saveKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('保存失败:', e);
      return false;
    }
  }

  /** 加载游戏 */
  load(): SaveData | null {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (!raw) return null;
      const data = JSON.parse(raw) as SaveData;
      if (data.version !== this.version) {
        console.warn('存档版本不匹配，可能不兼容');
      }
      return data;
    } catch (e) {
      console.error('加载失败:', e);
      return null;
    }
  }

  /** 是否有存档 */
  hasSave(): boolean {
    return localStorage.getItem(this.saveKey) !== null;
  }

  /** 删除存档 */
  deleteSave(): void {
    localStorage.removeItem(this.saveKey);
  }

  /** 从 GameState 单例自动存档 */
  saveFromGameState(): boolean {
    const state = GameState.getGameState();
    return this.save({ version: this.version, timestamp: Date.now(), state });
  }

  /** 将存档加载回 GameState 单例 */
  loadToGameState(): boolean {
    const data = this.load();
    if (!data) return false;
    GameState.restoreFromData(data.state);
    return true;
  }

  /** 获取存档摘要 */
  getSaveSummary(): { exists: boolean; round: number; playerCount: number; theme: string } | null {
    const data = this.load();
    if (!data) return null;
    return {
      exists: true,
      round: data.state.roundCount,
      playerCount: data.state.players.filter((p) => !p.isBankrupt).length,
      theme: data.state.theme,
    };
  }
}

export const SaveSystem = new SaveSystemImpl();

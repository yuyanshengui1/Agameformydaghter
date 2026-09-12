import type { GameStateData, PlayerData, TileData, ThemeType, CharacterId } from '../types';
import { GAME_CONFIG, CHARACTERS } from '../config/gameConfig';
import { createTiles } from '../data/tileLayout';

/**
 * 全局游戏状态容器 - 单例模式。
 * 所有系统共享此实例，不依赖 Phaser。
 */
class GameStateManager {
  private state: GameStateData;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): GameStateData {
    return {
      theme: 'ice-castle',
      players: [],
      tiles: createTiles(),
      currentPlayerIndex: 0,
      roundCount: 1,
      isMoving: false,
      isChallengeActive: false,
      lastDiceResult: null,
      consecutiveDoubles: 0,
      gameOver: false,
      winnerId: null,
    };
  }

  /** 初始化新游戏 */
  initGame(theme: ThemeType, playerCount: number, humanCharacter: CharacterId): void {
    this.state = this.createInitialState();
    this.state.theme = theme;

    // 创建玩家：第一个为人类，其余为 AI
    const availableChars = [...CHARACTERS];
    const humanChar = availableChars.find((c) => c.id === humanCharacter)!;
    // 从可用角色中移除人类选择的角色
    const remaining = availableChars.filter((c) => c.id !== humanCharacter);

    const players: PlayerData[] = [];
    // 人类玩家
    players.push({
      id: 'player-0',
      name: humanChar.name + '(你)',
      character: humanChar.id as CharacterId,
      emoji: humanChar.emoji,
      color: humanChar.color,
      coins: GAME_CONFIG.INITIAL_COINS,
      position: 0,
      isHuman: true,
      isBankrupt: false,
      jailTurns: 0,
    });

    // AI 玩家
    for (let i = 0; i < playerCount - 1; i++) {
      const char = remaining[i];
      players.push({
        id: `player-${i + 1}`,
        name: char.name + '(AI)',
        character: char.id as CharacterId,
        emoji: char.emoji,
        color: char.color,
        coins: GAME_CONFIG.INITIAL_COINS,
        position: 0,
        isHuman: false,
        isBankrupt: false,
        jailTurns: 0,
      });
    }

    this.state.players = players;
  }

  /** 获取完整状态快照（深拷贝） */
  getGameState(): GameStateData {
    return JSON.parse(JSON.stringify(this.state));
  }

  /** 直接获取内部引用（系统内部使用，不对外暴露拷贝） */
  getInternalState(): GameStateData {
    return this.state;
  }

  /** 从外部数据恢复状态 */
  restoreFromData(data: GameStateData): void {
    this.state = JSON.parse(JSON.stringify(data));
  }

  /** 获取玩家 */
  getPlayer(playerId: string): PlayerData | undefined {
    return this.state.players.find((p) => p.id === playerId);
  }

  /** 获取当前玩家 */
  getCurrentPlayer(): PlayerData {
    return this.state.players[this.state.currentPlayerIndex];
  }

  /** 获取地块 */
  getTile(index: number): TileData | undefined {
    return this.state.tiles[index];
  }

  /** 设置移动状态 */
  setMoving(moving: boolean): void {
    this.state.isMoving = moving;
  }

  /** 设置挑战激活状态 */
  setChallengeActive(active: boolean): void {
    this.state.isChallengeActive = active;
  }

  /** 设置骰子结果 */
  setDiceResult(result: GameStateData['lastDiceResult']): void {
    this.state.lastDiceResult = result;
  }

  /** 重置 */
  reset(): void {
    this.state = this.createInitialState();
  }
}

export const GameState = new GameStateManager();

import type { TileEventResult, Question, TileType } from '../types';
import { GameState } from './GameState';
import { EconomySystem } from './EconomySystem';
import { QuizSystem } from './QuizSystem';
import { MoveSystem } from './MoveSystem';
import { GAME_CONFIG } from '../config/gameConfig';
import { CHANCE_CARDS, isCorner } from '../data/tileLayout';

export type { TileEventResult, TileEventType } from '../types';

/**
 * 地块事件系统 - 玩家落地后触发对应事件。
 * 这是最复杂的系统，负责分发各类地块事件。
 */
class TileEventSystemImpl {
  /**
   * 处理地块事件 - 根据地块类型分发。
   * 返回事件结果，UI 层根据结果决定是否弹出挑战面板。
   */
  handleTileEvent(tileIndex: number, playerId: string): TileEventResult {
    const tile = GameState.getTile(tileIndex);
    const player = GameState.getPlayer(playerId);
    if (!tile || !player) {
      return { type: 'none', message: '', coinsChange: 0, challengeRequired: false };
    }

    switch (tile.type) {
      case 'start':
        return this.handleStart(playerId);

      case 'treasure':
        return this.handleTreasure(playerId);

      case 'rest':
        return this.handleRest(playerId);

      case 'portal':
        return this.handlePortal(playerId);

      case 'chance':
        return this.handleChance(playerId);

      case 'tax':
        return this.handleTax(playerId);

      case 'jail':
        return this.handleJail(playerId);

      case 'math':
      case 'english':
      case 'chinese':
        return this.handleChallengeTile(tileIndex, playerId);

      default:
        return { type: 'none', message: '', coinsChange: 0, challengeRequired: false };
    }
  }

  /** 起点：落在起点发放奖励 */
  private handleStart(playerId: string): TileEventResult {
    EconomySystem.addCoins(playerId, GAME_CONFIG.START_BONUS);
    return {
      type: 'bonus',
      message: `🎉 经过起点，获得 ${GAME_CONFIG.START_BONUS} 金币！`,
      coinsChange: GAME_CONFIG.START_BONUS,
      challengeRequired: false,
    };
  }

  /** 宝藏：随机 10~40 金币 */
  private handleTreasure(playerId: string): TileEventResult {
    const coins = Math.floor(Math.random() * 31) + 10;
    EconomySystem.addCoins(playerId, coins);
    return {
      type: 'bonus',
      message: `💎 你发现了一个宝藏！获得 ${coins} 金币！`,
      coinsChange: coins,
      challengeRequired: false,
    };
  }

  /** 休息：恢复 5 金币 */
  private handleRest(playerId: string): TileEventResult {
    const coins = 5;
    EconomySystem.addCoins(playerId, coins);
    return {
      type: 'bonus',
      message: `🍵 好好休息了一下，恢复 ${coins} 金币。`,
      coinsChange: coins,
      challengeRequired: false,
    };
  }

  /** 传送门：随机传送 */
  private handlePortal(playerId: string): TileEventResult {
    const target = Math.floor(Math.random() * 44);
    MoveSystem.teleportPlayer(playerId, target);
    return {
      type: 'move',
      message: `🌀 传送门将你传送到了第 ${target + 1} 格！`,
      coinsChange: 0,
      challengeRequired: false,
    };
  }

  /** 机会卡 */
  private handleChance(playerId: string): TileEventResult {
    const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
    let coinsChange = 0;

    switch (card.type) {
      case 'coins':
        EconomySystem.addCoins(playerId, card.value);
        coinsChange = card.value;
        break;
      case 'move':
        // 移动效果由 UI 层处理（需要动画）
        return {
          type: 'move',
          message: card.description,
          coinsChange: 0,
          challengeRequired: false,
        };
      case 'teleport':
        if (card.target !== undefined) {
          MoveSystem.teleportPlayer(playerId, card.target);
        }
        return {
          type: 'move',
          message: card.description,
          coinsChange: 0,
          challengeRequired: false,
        };
    }

    return {
      type: 'bonus',
      message: card.description,
      coinsChange,
      challengeRequired: false,
    };
  }

  /** 纳税 */
  private handleTax(playerId: string): TileEventResult {
    const tax = Math.floor(Math.random() * 16) + 10; // 10~25
    EconomySystem.removeCoins(playerId, tax);
    return {
      type: 'penalty',
      message: `🏦 需要缴纳税款 ${tax} 金币。`,
      coinsChange: -tax,
      challengeRequired: false,
    };
  }

  /** 监狱：跳过一回合 */
  private handleJail(playerId: string): TileEventResult {
    const player = GameState.getPlayer(playerId);
    if (player) {
      player.jailTurns = 1;
    }
    return {
      type: 'penalty',
      message: `😴 你在休息室休息了一回合，下回合跳过。`,
      coinsChange: 0,
      challengeRequired: false,
    };
  }

  /**
   * 挑战型地块（算术/英语/语文）。
   * - 无主 → claim（答题获得地块）
   * - 自己的 → upgrade（答题后升级房屋）
   * - 别人的 → rent（立即支付租金）
   */
  private handleChallengeTile(tileIndex: number, playerId: string): TileEventResult {
    const tile = GameState.getTile(tileIndex);
    const player = GameState.getPlayer(playerId);
    if (!tile || !player) {
      return { type: 'none', message: '', coinsChange: 0, challengeRequired: false };
    }

    // 别人的地块 → 付租金
    if (tile.ownerId && tile.ownerId !== playerId) {
      const rent = EconomySystem.calculateRent(tile, tile.houseLevel);
      EconomySystem.transferCoins(playerId, tile.ownerId!, rent);
      const owner = GameState.getPlayer(tile.ownerId!);
      return {
        type: 'rent',
        message: `🏠 这是 ${owner?.name} 的地块（${tile.houseLevel} 级房屋），支付租金 ${rent} 金币。`,
        coinsChange: -rent,
        challengeRequired: false,
      };
    }

    // 自己的地块 → 答题后可升级
    if (tile.ownerId === playerId) {
      if (tile.houseLevel >= GAME_CONFIG.MAX_HOUSE_LEVEL) {
        return {
          type: 'none',
          message: `🏠 你的地块已满级！`,
          coinsChange: 0,
          challengeRequired: false,
        };
      }
      const question = QuizSystem.generateQuestion(tile.type);
      return {
        type: 'upgrade',
        message: `🏠 这是你的地块，答对题目可升级房屋！`,
        coinsChange: 0,
        challengeRequired: true,
        challengeTileType: tile.type,
      };
    }

    // 无主 → 答题获得地块
    const question = QuizSystem.generateQuestion(tile.type);
    return {
      type: 'claim',
      message: `✨ 这是空地，答对题目即可获得！`,
      coinsChange: 0,
      challengeRequired: true,
      challengeTileType: tile.type,
    };
  }

  /**
   * 答题后调用 - 处理认领或升级。
   */
  resolveChallenge(tileIndex: number, playerId: string, success: boolean): TileEventResult {
    const tile = GameState.getTile(tileIndex);
    const player = GameState.getPlayer(playerId);
    if (!tile || !player) {
      return { type: 'none', message: '', coinsChange: 0, challengeRequired: false };
    }

    if (success) {
      // 答对
      if (!tile.ownerId) {
        // 认领地块
        tile.ownerId = playerId;
        const bonus = Math.ceil(tile.price * 0.1);
        EconomySystem.addCoins(playerId, bonus);
        return {
          type: 'claim',
          message: `🎉 答对了！你获得了「${tile.name}」地块！奖励 ${bonus} 金币！`,
          coinsChange: bonus,
          challengeRequired: false,
        };
      } else if (tile.ownerId === playerId) {
        // 升级
        return this.executeUpgrade(tileIndex, playerId);
      }
    } else {
      // 答错
      const penalty = Math.ceil(tile.price * 0.05);
      EconomySystem.removeCoins(playerId, penalty);
      return {
        type: 'penalty',
        message: `😢 答错了，扣除 ${penalty} 金币。再接再厉！`,
        coinsChange: -penalty,
        challengeRequired: false,
      };
    }

    return { type: 'none', message: '', coinsChange: 0, challengeRequired: false };
  }

  /** 执行升级 */
  executeUpgrade(tileIndex: number, playerId: string): TileEventResult {
    const tile = GameState.getTile(tileIndex);
    const player = GameState.getPlayer(playerId);
    if (!tile || !player) {
      return { type: 'none', message: '', coinsChange: 0, challengeRequired: false };
    }

    if (tile.houseLevel >= GAME_CONFIG.MAX_HOUSE_LEVEL) {
      return {
        type: 'none',
        message: `🏠 房屋已满级！`,
        coinsChange: 0,
        challengeRequired: false,
      };
    }

    const cost = EconomySystem.calculateUpgradeCost(tile);
    if (!EconomySystem.hasEnoughCoins(playerId, cost)) {
      return {
        type: 'none',
        message: `💰 金币不足！升级需要 ${cost} 金币，你只有 ${player.coins} 金币。`,
        coinsChange: 0,
        challengeRequired: false,
      };
    }

    EconomySystem.removeCoins(playerId, cost);
    tile.houseLevel++;
    return {
      type: 'upgrade',
      message: `🏠 房屋升级到 ${tile.houseLevel} 级！花费 ${cost} 金币。`,
      coinsChange: -cost,
      challengeRequired: false,
    };
  }

  /** 生成题目 */
  generateQuestion(tileType: TileType): Question {
    return QuizSystem.generateQuestion(tileType);
  }
}

export const TileEventSystem = new TileEventSystemImpl();

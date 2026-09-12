import type { MovePath } from '../types';
import { GameState } from './GameState';
import { BoardSystem } from './BoardSystem';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * 角色移动系统 - 计算移动路径、更新位置、发放经过起点奖励。
 */
class MoveSystemImpl {
  /**
   * 计算逐步移动路径。
   * 返回每一步经过的地块索引数组。
   */
  calculatePath(currentPos: number, steps: number): MovePath {
    const total = GAME_CONFIG.TOTAL_TILES;
    const pathSteps: number[] = [];
    let passedStart = false;

    if (steps > 0) {
      for (let i = 1; i <= steps; i++) {
        const next = (currentPos + i) % total;
        if (next === 0 && i < steps) {
          passedStart = true;
        } else if (next === 0 && i === steps) {
          // 正好落在起点
          pathSteps.push(next);
          // 也算经过起点
          if (currentPos !== 0) passedStart = true;
          continue;
        }
        pathSteps.push(next);
      }
    } else if (steps < 0) {
      // 后退
      for (let i = 1; i <= Math.abs(steps); i++) {
        const next = ((currentPos - i) % total + total) % total;
        pathSteps.push(next);
      }
    }

    const finalPosition = pathSteps.length > 0 ? pathSteps[pathSteps.length - 1] : currentPos;

    return {
      steps: pathSteps,
      passedStart,
      finalPosition,
    };
  }

  /**
   * 执行移动 - 更新玩家位置，经过起点自动发奖金。
   * 返回路径供 UI 动画使用。
   */
  executeMove(playerId: string, steps: number): MovePath {
    const player = GameState.getPlayer(playerId);
    if (!player) {
      return { steps: [], passedStart: false, finalPosition: 0 };
    }

    const path = this.calculatePath(player.position, steps);

    // 更新位置
    player.position = path.finalPosition;

    // 经过起点发奖金
    if (path.passedStart) {
      player.coins += GAME_CONFIG.PASS_START_BONUS;
    }

    // 落在起点额外奖励
    if (path.finalPosition === 0 && steps !== 0) {
      player.coins += GAME_CONFIG.START_BONUS;
    }

    return path;
  }

  /** 传送玩家（不给经过起点奖励） */
  teleportPlayer(playerId: string, targetIndex: number): void {
    const player = GameState.getPlayer(playerId);
    if (player) {
      player.position = ((targetIndex % 44) + 44) % 44;
    }
  }

  /** 获取路径坐标数组（供 UI 动画用） */
  getPathPositions(path: MovePath, playerId: string): { x: number; y: number }[] {
    const slot = BoardSystem.getPlayerSlot(playerId, path.finalPosition);
    return path.steps.map((idx) => BoardSystem.getPlayerPixelPosition(idx, slot));
  }
}

export const MoveSystem = new MoveSystemImpl();

import type { DiceResult } from '../types';

/**
 * 骰子系统 - 投掷两颗骰子。
 */
class DiceSystemImpl {
  /** 投掷两颗骰子 */
  roll(): DiceResult {
    const dice1 = this.rollSingle();
    const dice2 = this.rollSingle();
    return {
      dice1,
      dice2,
      total: dice1 + dice2,
      isDouble: dice1 === dice2,
    };
  }

  /** 投掷单颗骰子 (1~6) */
  rollSingle(): number {
    return Math.floor(Math.random() * 6) + 1;
  }
}

export const DiceSystem = new DiceSystemImpl();

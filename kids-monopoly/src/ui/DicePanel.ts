import type { DiceResult } from '../types';

/**
 * 骰子面板 - 显示骰子结果，处理掷骰子按钮。
 */
export class DicePanel {
  private dice1El: HTMLElement;
  private dice2El: HTMLElement;
  private rollBtnEl: HTMLButtonElement;
  private onRollCallback: (() => void) | null = null;

  // 骰子点数对应的 emoji
  private readonly DICE_FACES = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  constructor() {
    this.dice1El = document.getElementById('dice-1')!;
    this.dice2El = document.getElementById('dice-2')!;
    this.rollBtnEl = document.getElementById('roll-btn') as HTMLButtonElement;

    this.rollBtnEl.addEventListener('click', () => {
      if (this.onRollCallback && !this.rollBtnEl.disabled) {
        this.onRollCallback();
      }
    });
  }

  /** 设置掷骰子回调 */
  onRoll(callback: () => void): void {
    this.onRollCallback = callback;
  }

  /** 设置按钮可用状态 */
  setEnabled(enabled: boolean): void {
    this.rollBtnEl.disabled = !enabled;
  }

  /** 播放骰子旋转动画 */
  playRollAnimation(duration: number, onComplete: () => void): void {
    this.dice1El.classList.add('rolling');
    this.dice2El.classList.add('rolling');

    const interval = setInterval(() => {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      this.dice1El.textContent = this.DICE_FACES[r1];
      this.dice2El.textContent = this.DICE_FACES[r2];
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      this.dice1El.classList.remove('rolling');
      this.dice2El.classList.remove('rolling');
      onComplete();
    }, duration);
  }

  /** 显示骰子结果 */
  showResult(result: DiceResult): void {
    this.dice1El.textContent = this.DICE_FACES[result.dice1];
    this.dice2El.textContent = this.DICE_FACES[result.dice2];
  }

  /** 重置骰子显示 */
  reset(): void {
    this.dice1El.textContent = '🎲';
    this.dice2El.textContent = '🎲';
  }
}

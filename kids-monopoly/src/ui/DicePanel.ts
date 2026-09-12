import type { DiceResult } from '../types';
import { DICE_IMAGES } from '../config/assets';

/**
 * 骰子面板 - 显示骰子结果，处理掷骰子按钮。
 */
export class DicePanel {
  private dice1El: HTMLElement;
  private dice2El: HTMLElement;
  private rollBtnEl: HTMLButtonElement;
  private onRollCallback: (() => void) | null = null;

  constructor() {
    this.dice1El = document.getElementById('dice-1')!;
    this.dice2El = document.getElementById('dice-2')!;
    this.rollBtnEl = document.getElementById('roll-btn') as HTMLButtonElement;

    this.rollBtnEl.addEventListener('click', () => {
      if (this.onRollCallback && !this.rollBtnEl.disabled) {
        this.onRollCallback();
      }
    });

    // 初始显示默认骰子图（点数 1）
    this.setDiceImage(this.dice1El, 1);
    this.setDiceImage(this.dice2El, 1);
  }

  /** 设置掷骰子回调 */
  onRoll(callback: () => void): void {
    this.onRollCallback = callback;
  }

  /** 设置按钮可用状态 */
  setEnabled(enabled: boolean): void {
    this.rollBtnEl.disabled = !enabled;
  }

  /** 将骰子元素设置为指定点数的图片 */
  private setDiceImage(el: HTMLElement, point: number): void {
    const src = DICE_IMAGES[point] ?? DICE_IMAGES[1];
    el.innerHTML = `<img src="${src}" alt="骰子 ${point} 点" draggable="false" />`;
  }

  /** 播放骰子旋转动画 */
  playRollAnimation(duration: number, onComplete: () => void): void {
    this.dice1El.classList.add('rolling');
    this.dice2El.classList.add('rolling');

    const interval = setInterval(() => {
      const r1 = Math.floor(Math.random() * 6) + 1;
      const r2 = Math.floor(Math.random() * 6) + 1;
      this.setDiceImage(this.dice1El, r1);
      this.setDiceImage(this.dice2El, r2);
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
    this.setDiceImage(this.dice1El, result.dice1);
    this.setDiceImage(this.dice2El, result.dice2);
  }

  /** 重置骰子显示 */
  reset(): void {
    this.setDiceImage(this.dice1El, 1);
    this.setDiceImage(this.dice2El, 1);
  }
}

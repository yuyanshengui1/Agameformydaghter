import type { GameStateData, Question, TileType } from '../types';
import { GameState } from '../systems/GameState';
import { SaveSystem } from '../systems/SaveSystem';
import { TopBar } from './TopBar';
import { DicePanel } from './DicePanel';
import { ChallengePanel } from './ChallengePanel';
import { MenuPanel } from './MenuPanel';

/**
 * HUD 总管理器 - 创建并协调所有子面板。
 */
export class HUDManager {
  private topBar: TopBar;
  private dicePanel: DicePanel;
  private challengePanel: ChallengePanel;
  private menuPanel: MenuPanel;
  private messageToast: HTMLElement;
  private messageTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.topBar = new TopBar();
    this.dicePanel = new DicePanel();
    this.challengePanel = new ChallengePanel();
    this.menuPanel = new MenuPanel();

    this.messageToast = document.getElementById('message-toast')!;

    // 存档按钮
    document.getElementById('save-btn')!.addEventListener('click', () => {
      const success = SaveSystem.saveFromGameState();
      this.showMessage(success ? '💾 游戏已保存！' : '❌ 保存失败！');
    });

    this.menuPanel.setCallbacks({
      onSave: () => {
        const success = SaveSystem.saveFromGameState();
        this.showMessage(success ? '💾 游戏已保存！' : '❌ 保存失败！');
      },
    });
  }

  /** 初始化并绑定事件 */
  init(callbacks: {
    onRoll: () => void;
    onRestart: () => void;
    onQuit: () => void;
  }): void {
    this.dicePanel.onRoll(callbacks.onRoll);
    this.menuPanel.setCallbacks({
      onSave: () => {
        const success = SaveSystem.saveFromGameState();
        this.showMessage(success ? '💾 游戏已保存！' : '❌ 保存失败！');
      },
      onRestart: callbacks.onRestart,
      onQuit: callbacks.onQuit,
    });
  }

  /** 显示 HUD */
  show(): void {
    document.getElementById('hud-overlay')!.classList.remove('hidden');
  }

  /** 隐藏 HUD */
  hide(): void {
    document.getElementById('hud-overlay')!.classList.add('hidden');
  }

  /** 更新所有显示 */
  updateAll(): void {
    const state = GameState.getGameState();
    this.topBar.update(state);
    this.dicePanel.setEnabled(!state.isMoving && !state.isChallengeActive && !state.gameOver);

    // 显示上次骰子结果
    if (state.lastDiceResult) {
      this.dicePanel.showResult(state.lastDiceResult);
    }
  }

  /** 设置骰子按钮可用 */
  setDiceEnabled(enabled: boolean): void {
    this.dicePanel.setEnabled(enabled);
  }

  /** 播放骰子动画 */
  playDiceAnimation(duration: number, onComplete: () => void): void {
    this.dicePanel.playRollAnimation(duration, onComplete);
  }

  /** 显示骰子结果 */
  showDiceResult(dice1: number, dice2: number): void {
    this.dicePanel.showResult({ dice1, dice2, total: dice1 + dice2, isDouble: dice1 === dice2 });
  }

  /** 显示挑战 */
  showChallenge(
    question: Question,
    tileType: TileType,
    onComplete: (success: boolean) => void
  ): void {
    this.challengePanel.show(question, tileType, onComplete);
  }

  /** 隐藏挑战 */
  hideChallenge(): void {
    this.challengePanel.hide();
  }

  /** 显示消息 */
  showMessage(text: string, duration = 2500): void {
    this.messageToast.textContent = text;
    this.messageToast.classList.add('show');

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = setTimeout(() => {
      this.messageToast.classList.remove('show');
    }, duration);
  }

  /** 显示胜利画面 */
  showWinner(name: string, emoji: string, onRestart: () => void): void {
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    overlay.innerHTML = `
      <div class="winner-panel">
        <div class="winner-emoji">${emoji}</div>
        <div class="winner-text">🏆 游戏结束！</div>
        <div class="winner-name">${name} 获胜！</div>
        <button class="menu-action-btn" id="winner-restart">🔄 再玩一次</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('winner-restart')!.addEventListener('click', () => {
      overlay.remove();
      onRestart();
    });
  }
}

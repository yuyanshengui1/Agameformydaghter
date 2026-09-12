import Phaser from 'phaser';
import type { ThemeType, CharacterId } from '../types';
import { GameState } from '../systems/GameState';
import { SaveSystem } from '../systems/SaveSystem';
import { THEMES } from '../config/gameConfig';

/**
 * 菜单场景 - 处理开始界面的 DOM 交互。
 * 主题选择、玩家数量选择、角色选择、开始/继续游戏。
 */
export class MenuScene extends Phaser.Scene {
  private selectedTheme: ThemeType = 'ice-castle';
  private selectedPlayerCount: number = 3;
  private selectedCharacter: CharacterId = 'rabbit';
  private startScreenEl: HTMLElement;

  constructor() {
    super({ key: 'MenuScene' });
    this.startScreenEl = document.getElementById('start-screen')!;
  }

  create(): void {
    // 隐藏 HUD
    document.getElementById('hud-overlay')?.classList.add('hidden');

    // 显示开始界面
    this.startScreenEl.classList.remove('hidden');

    // 绑定主题选择
    document.querySelectorAll('.theme-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedTheme = (btn as HTMLElement).dataset.theme as ThemeType;
        this.applyTheme();
      });
    });

    // 绑定玩家数量选择
    document.querySelectorAll('.player-count-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.player-count-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedPlayerCount = parseInt((btn as HTMLElement).dataset.count!, 10);
      });
    });

    // 绑定角色选择
    document.querySelectorAll('.character-card').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.character-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedCharacter = (card as HTMLElement).dataset.character as CharacterId;
      });
    });

    // 绑定开始按钮
    document.getElementById('start-btn')!.addEventListener('click', () => {
      this.startNewGame();
    });

    // 绑定继续按钮
    const continueBtn = document.getElementById('continue-btn')!;
    continueBtn.addEventListener('click', () => {
      this.continueGame();
    });

    // 检查存档
    if (SaveSystem.hasSave()) {
      continueBtn.classList.remove('hidden');
    } else {
      continueBtn.classList.add('hidden');
    }

    this.applyTheme();
  }

  /** 应用主题到 body */
  private applyTheme(): void {
    const themeDef = THEMES.find((t) => t.id === this.selectedTheme);
    if (themeDef) {
      document.body.className = themeDef.bodyClass;
    }
  }

  /** 开始新游戏 */
  private startNewGame(): void {
    GameState.initGame(this.selectedTheme, this.selectedPlayerCount, this.selectedCharacter);
    this.startScreenEl.classList.add('hidden');
    this.scene.start('GameScene');
  }

  /** 继续游戏 */
  private continueGame(): void {
    if (SaveSystem.loadToGameState()) {
      this.startScreenEl.classList.add('hidden');
      this.scene.start('GameScene');
    } else {
      // 加载失败
      alert('存档加载失败，请重新开始。');
    }
  }
}

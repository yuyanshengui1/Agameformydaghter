import type { GameStateData } from '../types';
import { GameState } from '../systems/GameState';

/**
 * 顶部状态栏 - 显示回合数和玩家列表。
 */
export class TopBar {
  private roundInfoEl: HTMLElement;
  private playerListEl: HTMLElement;

  constructor() {
    this.roundInfoEl = document.getElementById('round-info')!;
    this.playerListEl = document.getElementById('player-list')!;
  }

  /** 更新显示 */
  update(state: GameStateData): void {
    this.roundInfoEl.textContent = `第 ${state.roundCount} 回合`;

    this.playerListEl.innerHTML = '';
    for (const player of state.players) {
      const item = document.createElement('div');
      item.className = 'player-item';
      if (player.id === state.players[state.currentPlayerIndex].id) {
        item.classList.add('active');
      }
      if (player.isBankrupt) {
        item.classList.add('bankrupt');
      }

      const emoji = document.createElement('span');
      emoji.className = 'player-emoji';
      emoji.textContent = player.emoji;

      const name = document.createElement('span');
      name.className = 'player-name';
      name.textContent = player.name;

      const coins = document.createElement('span');
      coins.className = 'player-coins';
      coins.textContent = `💰${player.coins}`;

      item.appendChild(emoji);
      item.appendChild(name);
      item.appendChild(coins);
      this.playerListEl.appendChild(item);
    }
  }

  /** 刷新（从 GameState 读取最新状态） */
  refresh(): void {
    this.update(GameState.getGameState());
  }
}

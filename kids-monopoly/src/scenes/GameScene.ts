import Phaser from 'phaser';
import type { ThemeType, TileData, MovePath } from '../types';
import { GameState } from '../systems/GameState';
import { DiceSystem } from '../systems/DiceSystem';
import { BoardSystem } from '../systems/BoardSystem';
import { MoveSystem } from '../systems/MoveSystem';
import { TileEventSystem } from '../systems/TileEventSystem';
import { TurnSystem } from '../systems/TurnSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { SaveSystem } from '../systems/SaveSystem';
import { HUDManager } from '../ui/HUDManager';
import { GAME_CONFIG, CHARACTERS, THEMES } from '../config/gameConfig';
import { TILE_TEXTURE_MAP, CHAR_TEXTURE_MAP } from '../config/assets';
import { createTiles, isCorner } from '../data/tileLayout';
import { getTilePosition, getPlayerPixelPosition } from '../utils/boardMath';

/** 游戏阶段 */
type GamePhase =
  | 'idle'
  | 'rolling'
  | 'moving'
  | 'event'
  | 'challenge'
  | 'switching'
  | 'gameover';

/**
 * 主游戏场景 - 渲染棋盘、角色，协调移动和事件。
 */
export class GameScene extends Phaser.Scene {
  private hud: HUDManager;
  private phase: GamePhase = 'idle';
  private tileGraphics: Phaser.GameObjects.Container[] = [];
  private playerTokens: Map<string, Phaser.GameObjects.Image> = new Map();
  private houseMarkers: Map<number, Phaser.GameObjects.Text> = new Map();
  private ownerBadges: Map<number, Phaser.GameObjects.Rectangle> = new Map();
  private boardContainer!: Phaser.GameObjects.Container;
  private currentTheme: ThemeType = 'ice-castle';

  constructor() {
    super({ key: 'GameScene' });
    this.hud = new HUDManager();
  }

  create(): void {
    // 应用主题
    const state = GameState.getInternalState();
    this.currentTheme = state.theme;
    this.applyTheme(this.currentTheme);

    // 隐藏开始界面
    document.getElementById('start-screen')?.classList.add('hidden');

    // 创建棋盘
    this.createBoard();

    // 创建角色
    this.createPlayerTokens();

    // 初始化 HUD
    this.hud.show();
    this.hud.init({
      onRoll: () => this.handleRoll(),
      onRestart: () => this.restartGame(),
      onQuit: () => this.quitToMenu(),
    });
    this.hud.updateAll();

    // 如果当前玩家是 AI，自动开始
    this.time.delayedCall(500, () => this.checkAITurn());
  }

  /** 创建棋盘 */
  private createBoard(): void {
    this.boardContainer = this.add.container(0, 0);

    const tiles = GameState.getInternalState().tiles;

    for (const tile of tiles) {
      const pos = getTilePosition(tile.index);
      const isCornerTile = isCorner(tile.index);
      const tileSize = isCornerTile ? 106 : 85;

      // 地块背景
      const bg = this.add.rectangle(pos.x, pos.y, tileSize - 4, tileSize - 4, this.getTileColor(tile.type), 0.85);
      bg.setStrokeStyle(3, this.getTileBorderColor(tile.type), 1);

      // 地块图标（使用预加载的图片纹理）
      const iconSize = isCornerTile ? 44 : 36;
      const textureKey = TILE_TEXTURE_MAP[tile.type];
      let tileIcon: Phaser.GameObjects.Image;
      if (textureKey && this.textures.exists(textureKey)) {
        tileIcon = this.add.image(pos.x, pos.y - 12, textureKey).setDisplaySize(iconSize, iconSize);
      } else {
        // 回退：使用 emoji
        const emojiText = this.add.text(pos.x, pos.y - 12, tile.emoji, {
          fontSize: isCornerTile ? '32px' : '26px',
        }).setOrigin(0.5);
        tileIcon = emojiText as unknown as Phaser.GameObjects.Image;
      }

      // 地块名称
      const nameText = this.add.text(pos.x, pos.y + 20, tile.name, {
        fontSize: '11px',
        color: '#333333',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);

      // 价格标签（仅可购买地块）
      if (tile.price > 0) {
        const priceText = this.add.text(pos.x, pos.y + 34, `💰${tile.price}`, {
          fontSize: '10px',
          color: '#666666',
          fontFamily: 'sans-serif',
        }).setOrigin(0.5);
        this.boardContainer.add(priceText);
      }

      // 房屋标记占位
      const houseMarker = this.add.text(pos.x, pos.y - 30, '', {
        fontSize: '14px',
      }).setOrigin(0.5);
      this.houseMarkers.set(tile.index, houseMarker);

      // 归属色条
      const ownerBadge = this.add.rectangle(pos.x, pos.y + tileSize / 2 - 2, tileSize - 8, 6, 0xffffff, 0);
      this.ownerBadges.set(tile.index, ownerBadge);

      this.boardContainer.add([bg, tileIcon, nameText, houseMarker, ownerBadge]);
      this.tileGraphics.push(this.boardContainer.getAt(this.boardContainer.length - 1) as Phaser.GameObjects.Container);
    }

    this.updateTileDisplay();
  }

  /** 创建角色 token */
  private createPlayerTokens(): void {
    const state = GameState.getInternalState();
    state.players.forEach((player, slot) => {
      const pos = getPlayerPixelPosition(player.position, slot);
      const textureKey = CHAR_TEXTURE_MAP[player.character];
      let token: Phaser.GameObjects.Image | Phaser.GameObjects.Text;

      if (textureKey && this.textures.exists(textureKey)) {
        // 图片 token + 底层深色圆形阴影
        const shadow = this.add.circle(pos.x + 2, pos.y + 2, 22, 0x000000, 0.25);
        this.boardContainer.add(shadow);
        token = this.add.image(pos.x, pos.y, textureKey).setDisplaySize(40, 40);
      } else {
        // 回退：使用 emoji
        token = this.add
          .text(pos.x, pos.y, player.emoji, { fontSize: '28px' })
          .setOrigin(0.5);
        token.setShadow(2, 2, '#000000', 2);
      }

      this.playerTokens.set(player.id, token as Phaser.GameObjects.Image);
    });
  }

  /** 应用主题 */
  private applyTheme(theme: ThemeType): void {
    const themeDef = THEMES.find((t) => t.id === theme);
    if (themeDef) {
      document.body.className = themeDef.bodyClass;
    }
  }

  /** 获取地块背景颜色 */
  private getTileColor(type: string): number {
    const colors: Record<string, number> = {
      start: 0xffd700,
      math: 0xffe4b5,
      english: 0xb0e2ff,
      chinese: 0xdda0dd,
      treasure: 0xffd700,
      rest: 0x98fb98,
      portal: 0x9370db,
      chance: 0xfffacd,
      tax: 0xffb6c1,
      jail: 0xd3d3d3,
    };
    return colors[type] ?? 0xffffff;
  }

  /** 获取地块边框颜色 */
  private getTileBorderColor(type: string): number {
    const colors: Record<string, number> = {
      start: 0xffa500,
      math: 0xcd853f,
      english: 0x4682b4,
      chinese: 0x8a2be2,
      treasure: 0xdaa520,
      rest: 0x228b22,
      portal: 0x4b0082,
      chance: 0xd2b48c,
      tax: 0xdc143c,
      jail: 0x696969,
    };
    return colors[type] ?? 0xcccccc;
  }

  /** 更新地块显示（归属色条 + 房屋标记） */
  private updateTileDisplay(): void {
    const state = GameState.getInternalState();
    for (const tile of state.tiles) {
      // 房屋标记
      const houseMarker = this.houseMarkers.get(tile.index);
      if (houseMarker) {
        if (tile.houseLevel > 0) {
          houseMarker.setText('🏠'.repeat(Math.min(tile.houseLevel, 3)));
        } else {
          houseMarker.setText('');
        }
      }

      // 归属色条
      const ownerBadge = this.ownerBadges.get(tile.index);
      if (ownerBadge) {
        if (tile.ownerId) {
          const owner = state.players.find((p) => p.id === tile.ownerId);
          if (owner) {
            ownerBadge.setFillStyle(owner.color, 1);
          }
        } else {
          ownerBadge.setFillStyle(0xffffff, 0);
        }
      }
    }
  }

  /** 处理掷骰子 */
  private handleRoll(): void {
    if (this.phase !== 'idle') return;

    const player = TurnSystem.getCurrentPlayer();
    if (player.isBankrupt) {
      this.switchTurn();
      return;
    }

    // 监狱中的玩家跳过
    if (player.jailTurns > 0) {
      player.jailTurns--;
      this.hud.showMessage(`${player.emoji} ${player.name} 在休息，跳过本回合。`);
      this.time.delayedCall(1500, () => this.switchTurn());
      return;
    }

    this.phase = 'rolling';
    this.hud.setDiceEnabled(false);

    // 播放骰子动画
    this.hud.playDiceAnimation(800, () => {
      const result = DiceSystem.roll();
      GameState.setDiceResult(result);
      this.hud.showDiceResult(result.dice1, result.dice2);

      this.hud.showMessage(`${player.emoji} 掷出了 ${result.dice1} + ${result.dice2} = ${result.total}！`);

      // 检查连续双数
      const state = GameState.getInternalState();
      if (result.isDouble) {
        state.consecutiveDoubles++;
        if (state.consecutiveDoubles >= 3) {
          // 三次双数进监狱
          this.hud.showMessage(`⚡ 连续三次双数！${player.name} 被送进休息室！`);
          player.jailTurns = 1;
          MoveSystem.teleportPlayer(player.id, 22);
          this.updatePlayerPosition(player.id);
          this.time.delayedCall(2000, () => this.switchTurn());
          return;
        }
      } else {
        state.consecutiveDoubles = 0;
      }

      // 执行移动
      this.time.delayedCall(1000, () => this.executeMove(player.id, result.total));
    });
  }

  /** 执行移动动画 */
  private executeMove(playerId: string, steps: number): void {
    this.phase = 'moving';
    GameState.setMoving(true);
    this.hud.updateAll();

    const path = MoveSystem.executeMove(playerId, steps);

    if (path.steps.length === 0) {
      this.afterMove(playerId);
      return;
    }

    // 逐步移动动画
    let stepIndex = 0;
    const moveNext = () => {
      if (stepIndex >= path.steps.length) {
        this.afterMove(playerId);
        return;
      }

      const tileIndex = path.steps[stepIndex];
      const slot = BoardSystem.getPlayerSlot(playerId, tileIndex);
      const pos = getPlayerPixelPosition(tileIndex, slot);
      const token = this.playerTokens.get(playerId);

      if (token) {
        this.tweens.add({
          targets: token,
          x: pos.x,
          y: pos.y,
          duration: GAME_CONFIG.MOVE_STEP_DELAY,
          ease: 'Quad.easeOut',
          onComplete: () => {
            // 小弹跳
            this.tweens.add({
              targets: token,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 100,
              yoyo: true,
              onComplete: () => {
                stepIndex++;
                moveNext();
              },
            });
          },
        });
      } else {
        stepIndex++;
        moveNext();
      }
    };

    moveNext();
  }

  /** 移动完成后处理地块事件 */
  private afterMove(playerId: string): void {
    const player = GameState.getPlayer(playerId);
    if (!player) return;

    this.phase = 'event';
    GameState.setMoving(false);

    // 处理地块事件
    const result = TileEventSystem.handleTileEvent(player.position, playerId);

    // 更新显示
    this.updateTileDisplay();
    this.hud.updateAll();

    if (result.message) {
      this.hud.showMessage(result.message, 2500);
    }

    if (result.challengeRequired && result.challengeTileType) {
      // 需要答题
      this.time.delayedCall(2000, () => this.startChallenge(player.position, playerId, result.challengeTileType!));
    } else {
      // 不需要答题，检查破产和回合切换
      this.time.delayedCall(2000, () => this.afterEvent(playerId));
    }
  }

  /** 开始挑战 */
  private startChallenge(tileIndex: number, playerId: string, tileType: string): void {
    this.phase = 'challenge';
    GameState.setChallengeActive(true);
    this.hud.updateAll();

    const player = GameState.getPlayer(playerId);
    if (!player) return;

    if (player.isHuman) {
      // 人类玩家：显示挑战面板
      const question = TileEventSystem.generateQuestion(tileType as any);
      this.hud.showChallenge(question, tileType as any, (success) => {
        this.resolveChallenge(tileIndex, playerId, success);
      });
    } else {
      // AI 玩家：自动答题（70% 正确率）
      this.hud.showMessage(`${player.emoji} ${player.name} 正在答题...`, 2000);
      this.time.delayedCall(2000, () => {
        const aiSuccess = Math.random() < 0.7;
        this.resolveChallenge(tileIndex, playerId, aiSuccess);
      });
    }
  }

  /** 解析挑战结果 */
  private resolveChallenge(tileIndex: number, playerId: string, success: boolean): void {
    GameState.setChallengeActive(false);
    const result = TileEventSystem.resolveChallenge(tileIndex, playerId, success);

    this.updateTileDisplay();
    this.hud.updateAll();

    if (result.message) {
      this.hud.showMessage(result.message, 3000);
    }

    this.time.delayedCall(3000, () => this.afterEvent(playerId));
  }

  /** 事件处理完成后 */
  private afterEvent(playerId: string): void {
    // 检查破产
    if (TurnSystem.checkBankruptcy(playerId)) {
      const player = GameState.getPlayer(playerId);
      this.hud.showMessage(`${player?.emoji} ${player?.name} 破产了！退出游戏。`, 3000);
    }

    // 检查游戏结束
    if (TurnSystem.isGameOver()) {
      this.phase = 'gameover';
      const winner = TurnSystem.getWinner();
      if (winner) {
        this.hud.showWinner(winner.name, winner.emoji, () => this.restartGame());
      }
      return;
    }

    // 如果是双数，可以再掷一次
    const state = GameState.getInternalState();
    if (state.lastDiceResult?.isDouble && state.consecutiveDoubles > 0 && state.consecutiveDoubles < 3) {
      const player = GameState.getPlayer(playerId);
      if (player && !player.isBankrupt) {
        this.hud.showMessage(`${player.emoji} 双数！可以再掷一次！`, 2000);
        this.phase = 'idle';
        this.hud.setDiceEnabled(player.isHuman);
        if (!player.isHuman) {
          this.time.delayedCall(GAME_CONFIG.AI_DELAY, () => this.handleRoll());
        }
        return;
      }
    }

    this.switchTurn();
  }

  /** 切换回合 */
  private switchTurn(): void {
    this.phase = 'switching';
    const player = TurnSystem.nextTurn();
    this.hud.updateAll();

    this.phase = 'idle';

    // 跳过破产玩家
    if (player.isBankrupt) {
      this.time.delayedCall(500, () => this.switchTurn());
      return;
    }

    // 检查是否为 AI 回合
    this.time.delayedCall(800, () => this.checkAITurn());
  }

  /** 检查是否轮到 AI */
  private checkAITurn(): void {
    if (this.phase !== 'idle') return;

    const player = TurnSystem.getCurrentPlayer();
    if (!player.isHuman && !player.isBankrupt) {
      this.hud.setDiceEnabled(false);
      this.hud.showMessage(`${player.emoji} ${player.name} 的回合...`, 1500);
      this.time.delayedCall(GAME_CONFIG.AI_DELAY, () => {
        if (this.phase === 'idle') {
          this.handleRoll();
        }
      });
    } else if (player.isHuman && !player.isBankrupt) {
      this.hud.setDiceEnabled(true);
      this.hud.showMessage(`🎲 轮到你了！掷骰子吧！`, 2000);
    }
  }

  /** 更新角色位置 */
  private updatePlayerPosition(playerId: string): void {
    const player = GameState.getPlayer(playerId);
    if (!player) return;
    const token = this.playerTokens.get(playerId);
    if (token) {
      const slot = BoardSystem.getPlayerSlot(playerId, player.position);
      const pos = getPlayerPixelPosition(player.position, slot);
      token.setPosition(pos.x, pos.y);
    }
  }

  /** 重新开始 */
  private restartGame(): void {
    // 重置游戏
    const theme = this.currentTheme;
    const playerCount = GameState.getInternalState().players.length;
    const humanPlayer = GameState.getInternalState().players.find((p) => p.isHuman);
    GameState.initGame(theme, playerCount, humanPlayer?.character ?? 'rabbit');

    // 重新创建场景
    this.scene.restart();
  }

  /** 返回主菜单 */
  private quitToMenu(): void {
    this.hud.hide();
    this.scene.start('MenuScene');
  }
}

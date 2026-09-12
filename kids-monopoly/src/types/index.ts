/** 地块类型 */
export type TileType =
  | 'start'
  | 'math'
  | 'english'
  | 'chinese'
  | 'treasure'
  | 'rest'
  | 'portal'
  | 'chance'
  | 'tax'
  | 'jail';

/** 主题类型 */
export type ThemeType = 'ice-castle' | 'garden';

/** 玩家角色 ID */
export type CharacterId = 'rabbit' | 'fox' | 'bear' | 'cat';

/** 地块数据 */
export interface TileData {
  index: number;
  type: TileType;
  name: string;
  emoji: string;
  price: number;
  ownerId: string | null;
  houseLevel: number;
  /** 地块在棋盘上的位置区域：0=顶,1=右,2=底,3=左,-1=角 */
  side: number;
}

/** 玩家数据 */
export interface PlayerData {
  id: string;
  name: string;
  character: CharacterId;
  emoji: string;
  color: number;
  coins: number;
  position: number;
  isHuman: boolean;
  isBankrupt: boolean;
  /** 在监狱中剩余回合数 */
  jailTurns: number;
}

/** 游戏状态数据 */
export interface GameStateData {
  theme: ThemeType;
  players: PlayerData[];
  tiles: TileData[];
  currentPlayerIndex: number;
  roundCount: number;
  isMoving: boolean;
  isChallengeActive: boolean;
  lastDiceResult: { dice1: number; dice2: number; total: number; isDouble: boolean } | null;
  consecutiveDoubles: number;
  gameOver: boolean;
  winnerId: string | null;
}

/** 骰子结果 */
export interface DiceResult {
  dice1: number;
  dice2: number;
  total: number;
  isDouble: boolean;
}

/** 移动路径 */
export interface MovePath {
  steps: number[];
  passedStart: boolean;
  finalPosition: number;
}

/** 地块事件结果 */
export interface TileEventResult {
  type: 'claim' | 'upgrade' | 'rent' | 'bonus' | 'penalty' | 'move' | 'none';
  message: string;
  coinsChange: number;
  challengeRequired: boolean;
  challengeTileType?: TileType;
}

/** 算术题目 */
export interface MathQuestion {
  question: string;
  answer: number;
}

/** 英语单词 */
export interface EnglishWord {
  word: string;
  emoji: string;
  phonetic: string;
}

/** 中文词语 */
export interface ChineseWord {
  word: string;
  missingIndex: number;
  options: string[];
  answer: string;
}

/** 题目类型联合 */
export type Question =
  | { type: 'math'; data: MathQuestion }
  | { type: 'english'; data: EnglishWord }
  | { type: 'chinese'; data: ChineseWord };

/** 存档数据 */
export interface SaveData {
  version: number;
  timestamp: number;
  state: GameStateData;
}

/** 机会卡 */
export interface ChanceCard {
  description: string;
  type: 'coins' | 'move' | 'teleport';
  value: number;
  target?: number;
}

/** 地块事件类型 */
export type TileEventType = 'claim' | 'upgrade' | 'rent';

/** 语音识别回调 */
export interface VoiceCallbacks {
  onResult?: (success: boolean, transcript?: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

import type { ChineseWord } from '../types';

/**
 * 中文词语库 - 适合 6 岁儿童的常用词语。
 * 每个词条包含完整词语、缺失字索引、候选字选项和正确答案。
 */
export const CHINESE_WORDS: Omit<ChineseWord, 'options' | 'missingIndex'>[] = [
  { word: '太阳', answer: '阳' },
  { word: '月亮', answer: '亮' },
  { word: '星星', answer: '星' },
  { word: '花朵', answer: '花' },
  { word: '小草', answer: '草' },
  { word: '大树', answer: '树' },
  { word: '白云', answer: '云' },
  { word: '雨水', answer: '雨' },
  { word: '雪花', answer: '雪' },
  { word: '春风', answer: '风' },
  { word: '小猫', answer: '猫' },
  { word: '小狗', answer: '狗' },
  { word: '小鸡', answer: '鸡' },
  { word: '小鸟', answer: '鸟' },
  { word: '小鱼', answer: '鱼' },
  { word: '白马', answer: '马' },
  { word: '小羊', answer: '羊' },
  { word: '牛奶', answer: '奶' },
  { word: '苹果', answer: '果' },
  { word: '香蕉', answer: '蕉' },
  { word: '西瓜', answer: '瓜' },
  { word: '草莓', answer: '莓' },
  { word: '红色', answer: '红' },
  { word: '黄色', answer: '黄' },
  { word: '蓝色', answer: '蓝' },
  { word: '绿色', answer: '绿' },
  { word: '春天', answer: '春' },
  { word: '夏天', answer: '夏' },
  { word: '秋天', answer: '秋' },
  { word: '冬天', answer: '冬' },
  { word: '书包', answer: '包' },
  { word: '铅笔', answer: '笔' },
  { word: '橡皮', answer: '皮' },
  { word: '尺子', answer: '尺' },
  { word: '书本', answer: '书' },
  { word: '桌子', answer: '桌' },
  { word: '椅子', answer: '椅' },
  { word: '房子', answer: '房' },
  { word: '车子', answer: '车' },
  { word: '路桥', answer: '桥' },
];

/** 干扰字池 */
const DISTRACTORS = '日月山水火木土金玉石田天上下左右中外大小多少好坏高低长短明暗冷暖新旧快慢远近开关门窗读写听说看走跑飞坐立睡吃喝玩笑哭唱跳舞';

/** 从干扰字池中取 n 个不重复且不等于正确答案的字 */
function pickDistractors(answer: string, count: number): string[] {
  const pool = DISTRACTORS.split('').filter((c) => c !== answer);
  const result: string[] = [];
  const used = new Set<string>([answer]);
  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const ch = pool[idx];
    if (!used.has(ch)) {
      used.add(ch);
      result.push(ch);
    }
    pool.splice(idx, 1);
  }
  return result;
}

/** 洗牌 */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** 从词库中随机取一个词语并生成完整题目 */
export function getRandomChineseWord(): ChineseWord {
  const base = CHINESE_WORDS[Math.floor(Math.random() * CHINESE_WORDS.length)];
  const missingIndex = Math.floor(Math.random() * base.word.length);
  const answer = base.word[missingIndex];
  const distractors = pickDistractors(answer, 3);
  const options = shuffle([answer, ...distractors]);
  return {
    word: base.word,
    missingIndex,
    options,
    answer,
  };
}

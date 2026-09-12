import type { TileType, MathQuestion, EnglishWord, ChineseWord, Question } from '../types';
import { getRandomEnglishWord } from '../data/englishWords';
import { getRandomChineseWord } from '../data/chineseWords';
import { isSimilar } from '../utils/levenshtein';

/**
 * 出题系统 - 生成算术、英语、语文题目。
 */
class QuizSystemImpl {
  /**
   * 生成 100 以内加减法。
   * 加法：两数之和 < 100。
   * 减法：结果 >= 1，被减数和减数都不超过 100。
   */
  generateMathQuestion(): MathQuestion {
    const isAdd = Math.random() < 0.5;

    if (isAdd) {
      // 加法：a + b < 100，a,b 都 <= 99
      const a = Math.floor(Math.random() * 90) + 1; // 1~90
      const maxB = 98 - a; // 保证 a + b < 99
      const b = Math.floor(Math.random() * (maxB + 1)) + 1; // 1~maxB+1
      const answer = a + b;
      return { question: `${a} + ${b} = ?`, answer };
    } else {
      // 减法：a - b >= 1，a,b <= 100
      const a = Math.floor(Math.random() * 90) + 10; // 10~99
      const b = Math.floor(Math.random() * (a - 1)) + 1; // 1~a-1
      const answer = a - b;
      return { question: `${a} - ${b} = ?`, answer };
    }
  }

  /** 从英语词库随机取词 */
  getRandomEnglishWord(): EnglishWord {
    return getRandomEnglishWord();
  }

  /** 从中文词库随机取词并生成题目 */
  getRandomChineseWord(): ChineseWord {
    return getRandomChineseWord();
  }

  /** 根据地块类型生成题目 */
  generateQuestion(tileType: TileType): Question {
    switch (tileType) {
      case 'math':
        return { type: 'math', data: this.generateMathQuestion() };
      case 'english':
        return { type: 'english', data: this.getRandomEnglishWord() };
      case 'chinese':
        return { type: 'chinese', data: this.getRandomChineseWord() };
      default:
        // 安全回退
        return { type: 'math', data: this.generateMathQuestion() };
    }
  }

  /** 验证算术答案 */
  checkMathAnswer(question: MathQuestion, answer: number): boolean {
    return question.answer === answer;
  }

  /** 验证英语答案（模糊匹配） */
  checkEnglishAnswer(word: EnglishWord, spoken: string): boolean {
    return isSimilar(word.word.toLowerCase(), spoken.toLowerCase(), 0.6);
  }

  /** 验证语文答案 */
  checkChineseAnswer(question: ChineseWord, selected: string): boolean {
    return question.answer === selected;
  }
}

export const QuizSystem = new QuizSystemImpl();

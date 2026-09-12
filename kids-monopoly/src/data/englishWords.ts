import type { EnglishWord } from '../types';

/**
 * 英语单词库 - 适合 6 岁儿童的简单常见单词。
 * emoji 作为"图片"替代，phonetic 为音标。
 */
export const ENGLISH_WORDS: EnglishWord[] = [
  { word: 'apple', emoji: '🍎', phonetic: 'ˈæpəl' },
  { word: 'banana', emoji: '🍌', phonetic: 'bəˈnɑːnə' },
  { word: 'cat', emoji: '🐱', phonetic: 'kæt' },
  { word: 'dog', emoji: '🐶', phonetic: 'dɒɡ' },
  { word: 'sun', emoji: '☀️', phonetic: 'sʌn' },
  { word: 'moon', emoji: '🌙', phonetic: 'muːn' },
  { word: 'star', emoji: '⭐', phonetic: 'stɑː' },
  { word: 'fish', emoji: '🐟', phonetic: 'fɪʃ' },
  { word: 'bird', emoji: '🐦', phonetic: 'bɜːd' },
  { word: 'tree', emoji: '🌳', phonetic: 'triː' },
  { word: 'flower', emoji: '🌸', phonetic: 'ˈflaʊə' },
  { word: 'water', emoji: '💧', phonetic: 'ˈwɔːtə' },
  { word: 'milk', emoji: '🥛', phonetic: 'mɪlk' },
  { word: 'bread', emoji: '🍞', phonetic: 'bred' },
  { word: 'egg', emoji: '🥚', phonetic: 'eɡ' },
  { word: 'book', emoji: '📖', phonetic: 'bʊk' },
  { word: 'ball', emoji: '⚽', phonetic: 'bɔːl' },
  { word: 'house', emoji: '🏠', phonetic: 'haʊs' },
  { word: 'car', emoji: '🚗', phonetic: 'kɑː' },
  { word: 'bus', emoji: '🚌', phonetic: 'bʌs' },
  { word: 'pig', emoji: '🐷', phonetic: 'pɪɡ' },
  { word: 'cow', emoji: '🐮', phonetic: 'kaʊ' },
  { word: 'duck', emoji: '🦆', phonetic: 'dʌk' },
  { word: 'rabbit', emoji: '🐰', phonetic: 'ˈræbɪt' },
  { word: 'bear', emoji: '🐻', phonetic: 'beə' },
  { word: 'fox', emoji: '🦊', phonetic: 'fɒks' },
  { word: 'ice', emoji: '🧊', phonetic: 'aɪs' },
  { word: 'snow', emoji: '⛄', phonetic: 'snəʊ' },
  { word: 'rain', emoji: '🌧️', phonetic: 'reɪn' },
  { word: 'cloud', emoji: '☁️', phonetic: 'klaʊd' },
  { word: 'hand', emoji: '✋', phonetic: 'hænd' },
  { word: 'eye', emoji: '👁️', phonetic: 'aɪ' },
  { word: 'cake', emoji: '🎂', phonetic: 'keɪk' },
  { word: 'candy', emoji: '🍬', phonetic: 'ˈkændi' },
  { word: 'gift', emoji: '🎁', phonetic: 'ɡɪft' },
  { word: 'heart', emoji: '❤️', phonetic: 'hɑːt' },
  { word: 'key', emoji: '🔑', phonetic: 'kiː' },
  { word: 'clock', emoji: '🕐', phonetic: 'klɒk' },
  { word: 'shirt', emoji: '👕', phonetic: 'ʃɜːt' },
  { word: 'shoe', emoji: '👟', phonetic: 'ʃuː' },
];

/** 从词库中随机取一个单词 */
export function getRandomEnglishWord(): EnglishWord {
  return ENGLISH_WORDS[Math.floor(Math.random() * ENGLISH_WORDS.length)];
}

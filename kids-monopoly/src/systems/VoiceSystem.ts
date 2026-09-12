import type { VoiceCallbacks } from '../types';
import { isSimilar } from '../utils/levenshtein';

// 声明浏览器 Web Speech API 类型
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionType {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionType;
  webkitSpeechRecognition?: new () => SpeechRecognitionType;
}

/**
 * 语音系统 - 使用 Web Speech API。
 * - SpeechRecognition: 英语发音识别
 * - SpeechSynthesis: 中文朗读
 */
class VoiceSystemImpl {
  private recognition: SpeechRecognitionType | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private matchThreshold = 0.6;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /** 检测浏览器是否支持语音识别 */
  isRecognitionAvailable(): boolean {
    const w = window as WindowWithSpeech;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }

  /** 检测是否支持语音合成 */
  isSynthesisAvailable(): boolean {
    return this.synthesis !== null;
  }

  /** 启动英语发音识别 */
  startRecognition(targetWord: string, callbacks: VoiceCallbacks): boolean {
    const w = window as WindowWithSpeech;
    const RecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!RecognitionCtor) {
      // 不支持时通知需要键盘输入
      callbacks.onResult?.(false, '');
      return false;
    }

    try {
      this.recognition = new RecognitionCtor();
      this.recognition.lang = 'en-US';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;

      let matched = false;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          for (let j = 0; j < result.length; j++) {
            const transcript = result[j].transcript.trim();
            if (isSimilar(targetWord.toLowerCase(), transcript.toLowerCase(), this.matchThreshold)) {
              matched = true;
              callbacks.onResult?.(true, transcript);
              return;
            }
          }
        }
        // 所有候选都不匹配
        const firstTranscript = results[0]?.[0]?.transcript || '';
        callbacks.onResult?.(false, firstTranscript);
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        callbacks.onError?.(event.error);
      };

      this.recognition.onend = () => {
        if (!matched) {
          callbacks.onEnd?.();
        }
      };

      this.recognition.start();
      return true;
    } catch (e) {
      callbacks.onError?.(String(e));
      return false;
    }
  }

  /** 停止识别 */
  stopRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // 忽略
      }
      this.recognition = null;
    }
  }

  /** 设置匹配阈值 */
  setMatchThreshold(threshold: number): void {
    this.matchThreshold = threshold;
  }

  /** 朗读中文 */
  speakChinese(text: string, options?: { rate?: number; pitch?: number }): void {
    if (!this.synthesis) return;
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = options?.rate ?? 0.9;
    utterance.pitch = options?.pitch ?? 1.1;

    // 尝试选择中文语音
    const voices = this.synthesis.getVoices();
    const zhVoice = voices.find((v) => v.lang.startsWith('zh'));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    this.synthesis.speak(utterance);
  }

  /** 朗读英文 */
  speakEnglish(text: string, options?: { rate?: number }): void {
    if (!this.synthesis) return;
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = options?.rate ?? 0.8;

    const voices = this.synthesis.getVoices();
    const enVoice = voices.find((v) => v.lang.startsWith('en'));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    this.synthesis.speak(utterance);
  }

  /** 停止朗读 */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const VoiceSystem = new VoiceSystemImpl();

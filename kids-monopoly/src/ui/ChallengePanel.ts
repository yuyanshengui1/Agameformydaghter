import type { Question, TileType, VoiceCallbacks } from '../types';
import { QuizSystem } from '../systems/QuizSystem';
import { VoiceSystem } from '../systems/VoiceSystem';
import { isSimilar } from '../utils/levenshtein';

/**
 * 挑战面板 - 显示算术/英语/语文题目并处理答题。
 */
export class ChallengePanel {
  private overlay: HTMLElement;
  private titleEl: HTMLElement;
  private contentEl: HTMLElement;
  private feedbackEl: HTMLElement;
  private actionsEl: HTMLElement;
  private onCompleteCallback: ((success: boolean) => void) | null = null;
  private currentQuestion: Question | null = null;
  private currentTileType: TileType | null = null;
  private answered = false;

  constructor() {
    this.overlay = document.getElementById('challenge-overlay')!;
    this.titleEl = document.getElementById('challenge-title')!;
    this.contentEl = document.getElementById('challenge-content')!;
    this.feedbackEl = document.getElementById('challenge-feedback')!;
    this.actionsEl = document.getElementById('challenge-actions')!;
  }

  /** 显示挑战 */
  show(question: Question, tileType: TileType, onComplete: (success: boolean) => void): void {
    this.currentQuestion = question;
    this.currentTileType = tileType;
    this.onCompleteCallback = onComplete;
    this.answered = false;

    this.feedbackEl.classList.add('hidden');
    this.feedbackEl.textContent = '';
    this.actionsEl.innerHTML = '';
    this.contentEl.innerHTML = '';

    const titles: Record<TileType, string> = {
      math: '➕ 算术挑战',
      english: '🔤 英语挑战',
      chinese: '📖 语文挑战',
      start: '挑战',
      treasure: '宝藏',
      rest: '休息',
      portal: '传送',
      chance: '机会',
      tax: '纳税',
      jail: '监狱',
    };
    this.titleEl.textContent = titles[tileType] ?? '挑战';

    switch (question.type) {
      case 'math':
        this.renderMathQuestion(question.data.question);
        break;
      case 'english':
        this.renderEnglishQuestion(question.data.word, question.data.emoji, question.data.phonetic);
        break;
      case 'chinese':
        this.renderChineseQuestion(question.data);
        break;
    }

    this.overlay.classList.remove('hidden');
  }

  /** 隐藏 */
  hide(): void {
    this.overlay.classList.add('hidden');
    VoiceSystem.stopSpeaking();
    VoiceSystem.stopRecognition();
  }

  /** 渲染算术题 */
  private renderMathQuestion(questionStr: string): void {
    const qEl = document.createElement('div');
    qEl.className = 'challenge-question';
    qEl.textContent = questionStr;

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'challenge-input';
    input.placeholder = '?';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'action-btn';
    submitBtn.textContent = '✓ 确定';

    const submit = () => {
      if (this.answered || !this.currentQuestion) return;
      const value = parseInt(input.value, 10);
      if (isNaN(value)) return;
      const success = QuizSystem.checkMathAnswer(this.currentQuestion.data as any, value);
      this.handleResult(success);
    };

    submitBtn.addEventListener('click', submit);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submit();
    });

    this.contentEl.appendChild(qEl);
    this.contentEl.appendChild(input);
    this.actionsEl.appendChild(submitBtn);

    setTimeout(() => input.focus(), 100);
  }

  /** 渲染英语题 */
  private renderEnglishQuestion(word: string, emoji: string, phonetic: string): void {
    const emojiEl = document.createElement('div');
    emojiEl.className = 'challenge-emoji-display';
    emojiEl.textContent = emoji;

    const wordEl = document.createElement('div');
    wordEl.className = 'challenge-word-display';
    wordEl.textContent = word;

    const phoneticEl = document.createElement('div');
    phoneticEl.className = 'challenge-phonetic';
    phoneticEl.textContent = `/${phonetic}/`;

    const voiceBtn = document.createElement('button');
    voiceBtn.className = 'voice-btn';
    voiceBtn.textContent = '🎤 念出单词';

    const skipBtn = document.createElement('button');
    skipBtn.className = 'action-btn secondary';
    skipBtn.textContent = '⌨️ 键盘输入';
    skipBtn.addEventListener('click', () => {
      this.showKeyboardFallback(word);
    });

    voiceBtn.addEventListener('click', () => {
      if (this.answered) return;

      voiceBtn.classList.add('listening');
      voiceBtn.textContent = '🔊 播放发音中...';

      // 先播放单词发音，等发音结束后再开始录音，避免麦克风录到 TTS 声音
      VoiceSystem.speakEnglish(word, {
        onend: () => {
          if (this.answered) return;
          voiceBtn.textContent = '🔴 正在听...';

          const callbacks: VoiceCallbacks = {
            onResult: (success, transcript) => {
              if (this.answered) return;
              voiceBtn.classList.remove('listening');
              voiceBtn.textContent = '🎤 念出单词';
              if (success) {
                this.handleResult(true);
              } else if (transcript) {
                this.handleResult(false);
              }
            },
            onError: (error) => {
              voiceBtn.classList.remove('listening');
              voiceBtn.textContent = '🎤 念出单词';
              if (error === 'not-allowed' || error === 'service-not-allowed' || error === 'no-speech') {
                this.showKeyboardFallback(word);
              }
            },
            onEnd: () => {
              voiceBtn.classList.remove('listening');
              voiceBtn.textContent = '🎤 再念一次';
            },
          };

          const started = VoiceSystem.startRecognition(word, callbacks);
          if (!started) {
            // 不支持语音识别，显示键盘输入
            this.showKeyboardFallback(word);
          }
        },
      });
    });

    this.contentEl.appendChild(emojiEl);
    this.contentEl.appendChild(wordEl);
    this.contentEl.appendChild(phoneticEl);
    this.actionsEl.appendChild(voiceBtn);
    this.actionsEl.appendChild(skipBtn);
  }

  /** 键盘输入英语（降级方案） */
  private showKeyboardFallback(word: string): void {
    if (this.answered) return;
    this.contentEl.innerHTML = '';

    const hint = document.createElement('div');
    hint.className = 'challenge-word-display';
    hint.textContent = word;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'challenge-input';
    input.placeholder = '输入单词';
    input.style.width = '200px';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'action-btn';
    submitBtn.textContent = '✓ 确定';

    const submit = () => {
      if (this.answered) return;
      const value = input.value.trim();
      if (!value) return;
      const success = isSimilar(word.toLowerCase(), value.toLowerCase(), 0.6);
      this.handleResult(success);
    };

    submitBtn.addEventListener('click', submit);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submit();
    });

    this.contentEl.appendChild(hint);
    this.contentEl.appendChild(input);
    this.actionsEl.innerHTML = '';
    this.actionsEl.appendChild(submitBtn);

    setTimeout(() => input.focus(), 100);
  }

  /** 渲染语文题 */
  private renderChineseQuestion(data: { word: string; missingIndex: number; options: string[]; answer: string }): void {
    // 构建词语显示，缺失字用占位
    const wordEl = document.createElement('div');
    wordEl.className = 'chinese-word-display';

    for (let i = 0; i < data.word.length; i++) {
      if (i === data.missingIndex) {
        const span = document.createElement('span');
        span.className = 'missing-char';
        span.textContent = '?';
        wordEl.appendChild(span);
      } else {
        const span = document.createElement('span');
        span.textContent = data.word[i];
        wordEl.appendChild(span);
      }
    }

    // 听词语按钮
    const speakBtn = document.createElement('button');
    speakBtn.className = 'speak-btn';
    speakBtn.textContent = '🔊 听一听';
    speakBtn.addEventListener('click', () => {
      VoiceSystem.speakChinese(data.word);
    });

    // 选项
    const optionsEl = document.createElement('div');
    optionsEl.className = 'chinese-options';

    for (const option of data.options) {
      const btn = document.createElement('button');
      btn.className = 'chinese-option';
      btn.textContent = option;
      btn.addEventListener('click', () => {
        if (this.answered) return;
        const success = option === data.answer;
        this.handleResult(success);
      });
      optionsEl.appendChild(btn);
    }

    this.contentEl.appendChild(wordEl);
    this.contentEl.appendChild(speakBtn);
    this.actionsEl.appendChild(optionsEl);

    // 自动播放一次
    setTimeout(() => {
      VoiceSystem.speakChinese(data.word);
    }, 300);
  }

  /** 处理答题结果 */
  private handleResult(success: boolean): void {
    if (this.answered) return;
    this.answered = true;

    this.feedbackEl.classList.remove('hidden', 'correct', 'wrong');
    if (success) {
      this.feedbackEl.classList.add('correct');
      this.feedbackEl.textContent = '🎉 答对了！太棒了！';
    } else {
      this.feedbackEl.classList.add('wrong');
      if (this.currentQuestion?.type === 'math') {
        const q = this.currentQuestion.data as any;
        this.feedbackEl.textContent = `😢 答错了，正确答案是 ${q.answer}`;
      } else {
        this.feedbackEl.textContent = '😢 再试试看吧！';
      }
    }

    this.actionsEl.innerHTML = '';
    const continueBtn = document.createElement('button');
    continueBtn.className = 'action-btn';
    continueBtn.textContent = '➡️ 继续';
    continueBtn.addEventListener('click', () => {
      this.hide();
      this.onCompleteCallback?.(success);
    });
    this.actionsEl.appendChild(continueBtn);
  }
}

/**
 * 菜单面板 - 暂停菜单和帮助面板。
 */
export class MenuPanel {
  private menuOverlay: HTMLElement;
  private helpOverlay: HTMLElement;
  private onResumeCallback: (() => void) | null = null;
  private onSaveCallback: (() => void) | null = null;
  private onRestartCallback: (() => void) | null = null;
  private onQuitCallback: (() => void) | null = null;

  constructor() {
    this.menuOverlay = document.getElementById('menu-overlay')!;
    this.helpOverlay = document.getElementById('help-overlay')!;

    document.getElementById('menu-btn')!.addEventListener('click', () => this.showMenu());
    document.getElementById('help-btn')!.addEventListener('click', () => this.showHelp());
    document.getElementById('help-close-btn')!.addEventListener('click', () => this.hideHelp());

    document.getElementById('resume-btn')!.addEventListener('click', () => this.hideMenu());
    document.getElementById('save-menu-btn')!.addEventListener('click', () => {
      this.onSaveCallback?.();
    });
    document.getElementById('restart-btn')!.addEventListener('click', () => {
      this.hideMenu();
      this.onRestartCallback?.();
    });
    document.getElementById('quit-btn')!.addEventListener('click', () => {
      this.hideMenu();
      this.onQuitCallback?.();
    });
  }

  /** 设置回调 */
  setCallbacks(callbacks: {
    onResume?: () => void;
    onSave?: () => void;
    onRestart?: () => void;
    onQuit?: () => void;
  }): void {
    this.onResumeCallback = callbacks.onResume ?? null;
    this.onSaveCallback = callbacks.onSave ?? null;
    this.onRestartCallback = callbacks.onRestart ?? null;
    this.onQuitCallback = callbacks.onQuit ?? null;
  }

  /** 显示暂停菜单 */
  showMenu(): void {
    this.menuOverlay.classList.remove('hidden');
  }

  /** 隐藏暂停菜单 */
  hideMenu(): void {
    this.menuOverlay.classList.add('hidden');
  }

  /** 显示帮助 */
  showHelp(): void {
    this.helpOverlay.classList.remove('hidden');
  }

  /** 隐藏帮助 */
  hideHelp(): void {
    this.helpOverlay.classList.add('hidden');
  }
}

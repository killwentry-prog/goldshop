export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  enableClosingConfirmation: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      username?: string;
      first_name?: string;
      photo_url?: string;
    };
  };
  openTelegramLink: (url: string) => void;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function getTelegram(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

export function initTelegram(): void {
  const tg = getTelegram();
  if (!tg) return;

  try {
    tg.ready();
  } catch {
    // не блокируем рендер приложения, даже если SDK повёл себя неожиданно
  }
  try {
    tg.expand();
  } catch {
    // см. выше
  }
  try {
    tg.setHeaderColor('#050505');
    tg.setBackgroundColor('#050505');
  } catch {
    // старые версии клиента могут не поддерживать
  }
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  getTelegram()?.HapticFeedback?.impactOccurred(style);
}

export function getInitData(): string {
  return getTelegram()?.initData ?? '';
}

export function getTelegramUser() {
  return getTelegram()?.initDataUnsafe.user;
}

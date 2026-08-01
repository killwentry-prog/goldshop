import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { config } from '../config';

export interface TelegramInitUser {
  id: number;
  username?: string;
  first_name?: string;
  photo_url?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      telegramUser?: TelegramInitUser;
    }
  }
}

/**
 * Проверяет подпись initData, которую присылает Telegram WebApp SDK.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(req: Request, res: Response, next: NextFunction): void {
  const initData = req.header('X-Telegram-Init-Data');

  if (!initData) {
    res.status(401).json({ error: 'Отсутствует X-Telegram-Init-Data' });
    return;
  }

  if (!config.botToken) {
    res.status(500).json({ error: 'BOT_TOKEN не сконфигурирован на сервере' });
    return;
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(config.botToken).digest();
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) {
      res.status(401).json({ error: 'Невалидная подпись initData' });
      return;
    }

    const userRaw = params.get('user');
    if (userRaw) {
      req.telegramUser = JSON.parse(userRaw) as TelegramInitUser;
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Не удалось разобрать initData' });
  }
}

/** Мягкая версия для dev-режима: пропускает запрос, даже если подпись отсутствует. */
export function verifyTelegramInitDataDev(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const initData = req.header('X-Telegram-Init-Data');
  if (initData) {
    try {
      const params = new URLSearchParams(initData);
      const userRaw = params.get('user');
      if (userRaw) req.telegramUser = JSON.parse(userRaw) as TelegramInitUser;
    } catch {
      // игнорируем в dev-режиме
    }
  }
  next();
}

import { NextFunction, Request, Response } from 'express';
import { config } from '../config';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const telegramUser = req.telegramUser;
  if (!telegramUser || telegramUser.id !== config.adminId) {
    res.status(403).json({ error: 'Доступ только для администратора' });
    return;
  }
  next();
}

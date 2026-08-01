import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { calculatePrice, getMinOrderGold } from '../utils/pricing';
import { upsertUser } from '../db/users';
import { createOrder, attachScreenshot, getOrderByPublicId } from '../db/orders';
import { notifyAdminNewOrder } from '../bot';

export const ordersRouter = Router();

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Разрешены только изображения'));
      return;
    }
    cb(null, true);
  },
});

const calculateSchema = z.object({
  goldAmount: z.number().positive(),
});

ordersRouter.post('/calculate', (req, res) => {
  const parsed = calculateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректное количество Gold' });
    return;
  }

  const { goldAmount } = parsed.data;
  const minOrder = getMinOrderGold();
  if (goldAmount < minOrder) {
    res.status(400).json({ error: `Минимальный заказ — ${minOrder} Gold` });
    return;
  }

  res.json(calculatePrice(goldAmount));
});

const createOrderSchema = z.object({
  goldAmount: z.number().positive(),
});

ordersRouter.post('/', (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные данные заказа' });
    return;
  }

  const telegramUser = req.telegramUser;
  if (!telegramUser) {
    res.status(401).json({ error: 'Не удалось определить пользователя Telegram' });
    return;
  }

  const { goldAmount } = parsed.data;
  const minOrder = getMinOrderGold();
  if (goldAmount < minOrder) {
    res.status(400).json({ error: `Минимальный заказ — ${minOrder} Gold` });
    return;
  }

  const user = upsertUser({
    telegramId: telegramUser.id,
    username: telegramUser.username,
    firstName: telegramUser.first_name,
  });

  const { priceUah, listingPrice } = calculatePrice(goldAmount);

  const order = createOrder({
    userId: user.id,
    telegramId: user.telegram_id,
    username: user.username,
    goldAmount,
    priceUah,
    listingPrice,
  });

  res.status(201).json(order);
});

ordersRouter.post('/:publicId/screenshot', upload.single('screenshot'), async (req, res) => {
  const order = getOrderByPublicId(req.params.publicId);
  if (!order) {
    res.status(404).json({ error: 'Заказ не найден' });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: 'Файл не был загружен' });
    return;
  }

  attachScreenshot(order.id, req.file.filename);

  try {
    await notifyAdminNewOrder({
      publicId: order.public_id,
      username: order.username,
      telegramId: order.telegram_id,
      goldAmount: order.gold_amount,
      priceUah: order.price_uah,
      listingPrice: order.listing_price,
      screenshotFilePath: path.join(uploadsDir, req.file.filename),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Не удалось уведомить админа:', err);
  }

  res.json({ ok: true });
});

ordersRouter.get('/:publicId', (req, res) => {
  const order = getOrderByPublicId(req.params.publicId);
  if (!order) {
    res.status(404).json({ error: 'Заказ не найден' });
    return;
  }
  res.json(order);
});

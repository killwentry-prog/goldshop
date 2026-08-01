import { Telegraf, Markup } from 'telegraf';
import { config } from '../config';
import { getOrderByPublicId, updateOrderStatus, setAdminMessageId } from '../db/orders';

export const bot = new Telegraf(config.botToken);

bot.start((ctx) => {
  ctx.reply(
    `Добро пожаловать в ${config.shopName}!\n\nОткройте мини-приложение, чтобы купить Gold Standoff 2.`,
    Markup.inlineKeyboard([
      Markup.button.webApp('🛒 Открыть магазин', config.webAppUrl),
    ]),
  );
});

bot.command('admin', (ctx) => {
  if (ctx.from.id !== config.adminId) return;
  ctx.reply(
    'Панель администратора',
    Markup.inlineKeyboard([
      Markup.button.webApp('📊 Открыть админку', `${config.webAppUrl}/admin`),
    ]),
  );
});

bot.action(/^order_accept:(.+)$/, async (ctx) => {
  if (ctx.from?.id !== config.adminId) {
    await ctx.answerCbQuery('Недостаточно прав');
    return;
  }
  const publicId = ctx.match[1];
  const order = getOrderByPublicId(publicId);
  if (!order) {
    await ctx.answerCbQuery('Заказ не найден');
    return;
  }

  updateOrderStatus(order.id, 'accepted');
  await ctx.answerCbQuery('Заказ принят');
  await ctx.editMessageReplyMarkup(undefined);

  try {
    await bot.telegram.sendMessage(
      order.telegram_id,
      'Ваш заказ принят.\nМенеджер скоро купит ваш предмет.',
    );
  } catch {
    // пользователь мог заблокировать бота
  }
});

bot.action(/^order_reject:(.+)$/, async (ctx) => {
  if (ctx.from?.id !== config.adminId) {
    await ctx.answerCbQuery('Недостаточно прав');
    return;
  }
  const publicId = ctx.match[1];
  const order = getOrderByPublicId(publicId);
  if (!order) {
    await ctx.answerCbQuery('Заказ не найден');
    return;
  }

  updateOrderStatus(order.id, 'rejected');
  await ctx.answerCbQuery('Заказ отклонён');
  await ctx.editMessageReplyMarkup(undefined);

  try {
    await bot.telegram.sendMessage(
      order.telegram_id,
      `Ваш заказ был отклонён.\nЕсли вы считаете, что произошла ошибка — свяжитесь с менеджером: @${config.managerUsername}`,
    );
  } catch {
    // пользователь мог заблокировать бота
  }
});

export async function notifyAdminNewReview(params: {
  name: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const stars = '⭐'.repeat(params.rating) + '☆'.repeat(5 - params.rating);
  const text = [
    '📝 Новый отзыв на модерацию',
    '',
    `Имя: ${params.name}`,
    `Оценка: ${stars}`,
    `Комментарий: ${params.comment}`,
    '',
    'Опубликуйте его в разделе «Отзывы на модерации» в админке, если он настоящий.',
  ].join('\n');

  try {
    await bot.telegram.sendMessage(config.adminId, text);
  } catch {
    // админ мог ещё не запускать бота или заблокировать его
  }
}
export async function notifyAdminNewOrder(params: {
  publicId: string;
  username: string | null;
  telegramId: number;
  goldAmount: number;
  priceUah: number;
  listingPrice: number;
  screenshotFilePath?: string;
}): Promise<void> {
  const text = [
    '🆕 Новый заказ',
    '',
    `Username: ${params.username ? '@' + params.username : '—'}`,
    `Telegram ID: ${params.telegramId}`,
    `Количество Gold: ${params.goldAmount}`,
    `Стоимость: ${params.priceUah} грн`,
    `Сумма выставления: ${params.listingPrice} Gold`,
    `Время: ${new Date().toLocaleString('ru-RU')}`,
    `ID заказа: ${params.publicId}`,
  ].join('\n');

  const keyboard = Markup.inlineKeyboard([
    Markup.button.callback('✅ Принять', `order_accept:${params.publicId}`),
    Markup.button.callback('❌ Отклонить', `order_reject:${params.publicId}`),
  ]);

  if (params.screenshotFilePath) {
    const message = await bot.telegram.sendPhoto(
      config.adminId,
      { source: params.screenshotFilePath },
      { caption: text, ...keyboard },
    );
    const order = getOrderByPublicId(params.publicId);
    if (order) setAdminMessageId(order.id, message.message_id);
  } else {
    const message = await bot.telegram.sendMessage(config.adminId, text, keyboard);
    const order = getOrderByPublicId(params.publicId);
    if (order) setAdminMessageId(order.id, message.message_id);
  }
}

import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    // eslint-disable-next-line no-console
    console.warn(`[config] Переменная окружения ${name} не задана`);
    return '';
  }
  return value;
}

export const config = {
  botToken: required('BOT_TOKEN'),
  adminId: Number(required('ADMIN_ID', '0')),
  webAppUrl: required('WEBAPP_URL', 'http://localhost:5173'),
  databaseUrl: required('DATABASE_URL', './data/expshop.db'),
  port: Number(required('PORT', '3000')),
  goldRateUah: Number(process.env.GOLD_RATE_UAH ?? '0.30'),
  minOrderGold: Number(process.env.MIN_ORDER_GOLD ?? '500'),
  listingMarkup: Number(process.env.LISTING_MARKUP ?? '1.25'),
  shopName: process.env.SHOP_NAME ?? 'ExpShop',
  managerUsername: process.env.MANAGER_USERNAME ?? 'expshopgold',
};

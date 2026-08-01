import { db } from '../db';
import { config } from '../config';

function getSetting(key: string, fallback: number): number {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined;
  return row ? Number(row.value) : fallback;
}

export function getGoldRate(): number {
  return getSetting('gold_rate_uah', config.goldRateUah);
}

export function getMinOrderGold(): number {
  return getSetting('min_order_gold', config.minOrderGold);
}

export function getListingMarkup(): number {
  return getSetting('listing_markup', config.listingMarkup);
}

export interface PriceCalculation {
  goldAmount: number;
  priceUah: number;
  listingPrice: number;
}

/**
 * Считает стоимость покупки в грн и итоговую цену выставления лота
 * с наценкой (по умолчанию 25%) и уникальными случайными копейками,
 * чтобы каждая заявка выглядела как отдельный самостоятельный лот.
 */
export function calculatePrice(goldAmount: number): PriceCalculation {
  const rate = getGoldRate();
  const markup = getListingMarkup();

  const priceUah = round2(goldAmount * rate);
  const baseListing = goldAmount * markup;

  const randomCents = Math.floor(Math.random() * 100) / 100; // 0.00 - 0.99
  const listingPrice = round2(Math.floor(baseListing) + randomCents);

  return { goldAmount, priceUah, listingPrice };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

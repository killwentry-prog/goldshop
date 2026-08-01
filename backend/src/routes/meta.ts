import { Router } from 'express';
import { getGoldRate, getMinOrderGold, getListingMarkup } from '../utils/pricing';
import { config } from '../config';

export const metaRouter = Router();

metaRouter.get('/', (_req, res) => {
  res.json({
    shopName: config.shopName,
    managerUsername: config.managerUsername,
    goldRateUah: getGoldRate(),
    minOrderGold: getMinOrderGold(),
    listingMarkup: getListingMarkup(),
  });
});

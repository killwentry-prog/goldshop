import { getInitData } from './telegram';

const BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Ошибка запроса (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export interface MetaResponse {
  shopName: string;
  managerUsername: string;
  goldRateUah: number;
  minOrderGold: number;
  listingMarkup: number;
}

export interface PriceCalculation {
  goldAmount: number;
  priceUah: number;
  listingPrice: number;
}

export interface Order {
  id: number;
  public_id: string;
  gold_amount: number;
  price_uah: number;
  listing_price: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Review {
  id: number;
  name: string;
  avatar_url: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface PublicStats {
  completedOrders: number;
  clients: number;
  avgProcessingMinutes: number | null;
  totalGoldSold: number;
  avgRating: number | null;
  reviewsCount: number;
}

export interface ProfileData {
  id: number;
  username: string | null;
  firstName: string | null;
  totalGoldBought: number;
  ordersCount: number;
}

export const api = {
  getMeta: () => request<MetaResponse>('/meta'),
  getStats: () => request<PublicStats>('/stats'),
  getProfile: () => request<ProfileData>('/profile'),
  calculate: (goldAmount: number) =>
    request<PriceCalculation>('/orders/calculate', {
      method: 'POST',
      body: JSON.stringify({ goldAmount }),
    }),
  createOrder: (goldAmount: number) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ goldAmount }),
    }),
  uploadScreenshot: async (publicId: string, file: File) => {
    const formData = new FormData();
    formData.append('screenshot', file);
    const res = await fetch(`${BASE}/orders/${publicId}/screenshot`, {
      method: 'POST',
      headers: { 'X-Telegram-Init-Data': getInitData() },
      body: formData,
    });
    if (!res.ok) throw new Error('Не удалось загрузить скриншот');
    return res.json();
  },
  getReviews: () => request<Review[]>('/reviews'),
  submitReview: (data: { name: string; rating: number; comment: string }) =>
    request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  admin: {
    stats: () =>
      request<{ ordersToday: number; ordersTotal: number; goldTotal: number; revenueTotal: number }>(
        '/admin/stats',
      ),
    orders: (params: { search?: string; status?: string }) => {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.status) qs.set('status', params.status);
      return request<Order[]>(`/admin/orders?${qs.toString()}`);
    },
    reviews: () => request<AdminReview[]>('/admin/reviews'),
    approveReview: (id: number) =>
      request(`/admin/reviews/${id}/approve`, { method: 'POST' }),
    rejectReview: (id: number) =>
      request(`/admin/reviews/${id}/reject`, { method: 'POST' }),
  },
};

export interface AdminReview extends Review {
  approved: number;
}

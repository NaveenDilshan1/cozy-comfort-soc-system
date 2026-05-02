import { requests } from '../api/client';
import type { Seller } from '../types/models';

export const sellerService = {
    getAll: async (): Promise<Seller[]> => {
        return await requests.get<Seller[]>('/seller');
    },

    getById: async (id: number): Promise<Seller> => {
        return await requests.get<Seller>(`/seller/${id}`);
    },

    create: async (data: Omit<Seller, 'sellerId'>): Promise<Seller> => {
        return await requests.post<Seller>('/seller', data);
    },

    update: async (id: number, data: Seller): Promise<Seller> => {
        return await requests.put<Seller>(`/seller/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await requests.del<void>(`/seller/${id}`);
    },
};


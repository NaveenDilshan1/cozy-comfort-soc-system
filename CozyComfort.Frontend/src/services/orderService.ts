import { requests } from '../api/client';
import type { Order } from '../types/models';

export const orderService = {
    getAll: async (filters?: { userId?: number; supplierId?: number; role?: string }): Promise<Order[]> => {
        const params: any = {};
        if (filters?.userId) params.userId = filters.userId;
        if (filters?.supplierId) params.supplierId = filters.supplierId;
        if (filters?.role) params.role = filters.role;

        return await requests.get<Order[]>('/order', params);
    },

    getById: async (id: number): Promise<Order> => {
        return await requests.get<Order>(`/order/${id}`);
    },

    create: async (data: Partial<Order>): Promise<Order> => {
        return await requests.post<Order>('/order', data);
    },

    updateStatus: async (id: number, status: string): Promise<void> => {
        await requests.put<void>(`/order/${id}/status`, { status });
    },

    update: async (id: number, data: Order): Promise<Order> => {
        return await requests.put<Order>(`/order/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await requests.del<void>(`/order/${id}`);
    },
};

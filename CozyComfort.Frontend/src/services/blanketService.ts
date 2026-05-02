import { requests } from '../api/client';
import type { Blanket } from '../types/models';

export const blanketService = {
    getAll: async (): Promise<Blanket[]> => {
        return await requests.get<Blanket[]>('/blanket');
    },

    getById: async (id: number): Promise<Blanket> => {
        return await requests.get<Blanket>(`/blanket/${id}`);
    },

    create: async (data: Omit<Blanket, 'blanketId'>): Promise<Blanket> => {
        return await requests.post<Blanket>('/blanket', data);
    },

    update: async (id: number, data: Blanket): Promise<Blanket> => {
        return await requests.put<Blanket>(`/blanket/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await requests.del<void>(`/blanket/${id}`);
    },
};


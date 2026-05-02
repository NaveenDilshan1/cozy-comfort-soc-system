import { requests } from '../api/client';
import type { Distributor } from '../types/models';

export const distributorService = {
    getAll: async (): Promise<Distributor[]> => {
        return await requests.get<Distributor[]>('/distributor');
    },

    getById: async (id: number): Promise<Distributor> => {
        return await requests.get<Distributor>(`/distributor/${id}`);
    },

    create: async (data: Omit<Distributor, 'distributorId'>): Promise<Distributor> => {
        return await requests.post<Distributor>('/distributor', data);
    },

    update: async (id: number, data: Distributor): Promise<Distributor> => {
        return await requests.put<Distributor>(`/distributor/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await requests.del<void>(`/distributor/${id}`);
    },
};


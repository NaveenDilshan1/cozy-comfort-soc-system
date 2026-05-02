import { requests } from '../api/client';
import type { Manufacturer } from '../types/models';

export const manufacturerService = {
    getAll: async (): Promise<Manufacturer[]> => {
        return await requests.get<Manufacturer[]>('/manufacturer');
    },

    getById: async (id: number): Promise<Manufacturer> => {
        return await requests.get<Manufacturer>(`/manufacturer/${id}`);
    },

    create: async (data: Omit<Manufacturer, 'manufacturerId'>): Promise<Manufacturer> => {
        return await requests.post<Manufacturer>('/manufacturer', data);
    },

    update: async (id: number, data: Manufacturer): Promise<Manufacturer> => {
        return await requests.put<Manufacturer>(`/manufacturer/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await requests.del<void>(`/manufacturer/${id}`);
    },
};


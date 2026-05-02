import { requests } from '../api/client';
import type { Inventory } from '../types/models';

export const inventoryService = {
    getAll: async (): Promise<Inventory[]> => {
        return await requests.get<Inventory[]>('/inventory');
    },

    getByOwner: async (role: string, ownerId: number): Promise<Inventory[]> => {
        return await requests.get<Inventory[]>(`/inventory/${role}/${ownerId}`);
    },

    update: async (data: Inventory): Promise<Inventory> => {
        return await requests.post<Inventory>('/inventory/update', data);
    },

    restock: async (data: Inventory): Promise<Inventory> => {
        return await requests.post<Inventory>('/inventory/restock', data);
    }
};


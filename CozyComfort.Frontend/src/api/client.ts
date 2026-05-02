import axios, { type AxiosResponse } from 'axios';
import type { User, Inventory, Notification, Blanket, Order, Manufacturer } from '../types/models';

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: 'http://localhost:5250/api', // Use HTTP to avoid SSL issues in local dev
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            console.error('Network Error:', error.message);
        }
        return Promise.reject(error);
    }
);

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

export const requests = {
    get: <T>(url: string, params?: {}) => apiClient.get<T>(url, { params }).then(responseBody),
    post: <T>(url: string, body: {}) => apiClient.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => apiClient.put<T>(url, body).then(responseBody),
    del: <T>(url: string) => apiClient.delete<T>(url).then(responseBody),
};

export const Auth = {
    login: (user: any) => requests.post<User>('/auth/login', user),
    register: (user: any) => requests.post<User>('/auth/register', user),
    currentUser: () => requests.get<User>('/auth/currentUser'),
};

export const Products = {
    list: () => requests.get<Blanket[]>('/blanket'),
    details: (id: number) => requests.get<Blanket>(`/blanket/${id}`),
    create: (product: any) => requests.post<Blanket>('/blanket', product),
    update: (id: number, product: any) => requests.put<Blanket>(`/blanket/${id}`, product),
    delete: (id: number) => requests.del<void>(`/blanket/${id}`),
};

export const Manufacturers = {
    list: () => requests.get<Manufacturer[]>('/manufacturer'),
};

export const InventoryAPI = {
    list: () => requests.get<Inventory[]>('/inventory'),
    listByRole: (role: string, ownerId: number) => requests.get<Inventory[]>(`/inventory/${role}/${ownerId}`),
    listByRoleOnly: (role: string) => requests.get<Inventory[]>(`/inventory/by-role/${role}`),
    update: (inventory: Partial<Inventory>) => requests.post<Inventory>('/inventory/update', inventory),
    restock: (inventory: Partial<Inventory>) => requests.post<Inventory>('/inventory/restock', inventory),
};

export const OrdersAPI = {
    list: (params?: { userId?: number; supplierId?: number; role?: string; type?: string }) => requests.get<Order[]>('/order', params),
    details: (id: number) => requests.get<Order>(`/order/${id}`),
    create: (order: Partial<Order>) => requests.post<Order>('/order', order),
    updateStatus: (id: number, status: string) => requests.put<Order>(`/order/${id}/status`, { status }),
    delete: (id: number) => requests.del<void>(`/order/${id}`),
};

export const NotificationsAPI = {
    list: (userId: number) => requests.get<Notification[]>(`/notification/user/${userId}`),
    unread: (userId: number) => requests.get<Notification[]>(`/notification/unread/${userId}`),
    markRead: (id: number) => requests.put<void>(`/notification/mark-read/${id}`, {}),
};

const agent = {
    Auth,
    Products,
    Manufacturers,
    Inventory: InventoryAPI,
    Orders: OrdersAPI,
    Notifications: NotificationsAPI,
    Users: {
        list: () => requests.get<User[]>('/user'),
        listByRole: (role: string) => requests.get<User[]>(`/user/role/${role}`),
        details: (id: number) => requests.get<User>(`/user/${id}`),
    }
};

export default agent;

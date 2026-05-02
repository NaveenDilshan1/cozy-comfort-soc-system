import { Auth } from '../api/client';

export const authService = {
    register: async (userData: any) => {
        try {
            return await Auth.register(userData);
        } catch (error: any) {
            console.error('Registration API Error:', error.response?.data || error.message);
            throw error;
        }
    },

    login: async (credentials: any) => {
        try {
            return await Auth.login(credentials);
        } catch (error: any) {
            console.error('Login API Error:', error.response?.data || error.message);
            throw error;
        }
    }
};


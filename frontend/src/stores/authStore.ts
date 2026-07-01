import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  full_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,
      isAdmin: false,

      login: async (username: string, password: string) => {
        const res = await api.post('/auth/login', { username, password });
        const { access_token, user: u } = res.data || {};
        if (!access_token || !u) throw new Error('Invalid login response');
        localStorage.setItem('token', access_token);
        set({ user: u, token: access_token, isAdmin: u.role === 'admin', loading: false });
        return u;
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAdmin: false, loading: false });
      },

      initialize: async () => {
        const token = localStorage.getItem('token');
        if (!token) { set({ loading: false }); return; }
        try {
          const res = await api.get('/auth/me');
          const u = res.data;
          set({ user: u, token, isAdmin: u.role === 'admin', loading: false });
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, token: null, isAdmin: false, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAdmin: state.isAdmin }),
    },
  ),
);

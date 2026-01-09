import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export interface AuthUser {
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        
        login: (user) => 
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          }),
        
        logout: () => 
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          }),
        
        setLoading: (isLoading) => 
          set({ isLoading })
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
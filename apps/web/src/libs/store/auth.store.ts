import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'
import type { TUserSession } from '../api/auth'

export interface AuthState {
  accessToken: string | null
  user: TUserSession | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const authStore = new Store<AuthState>({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
})

export const setAuthSession = (accessToken: string, user: TUserSession) => {
  authStore.setState(() => ({
    accessToken,
    user,
    isAuthenticated: true,
    isLoading: false,
  }))
}

export const clearAuthSession = () => {
  authStore.setState(() => ({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }))
}

export const setAuthLoading = (isLoading: boolean) => {
  authStore.setState((prev) => ({
    ...prev,
    isLoading,
  }))
}

export function useAuth() {
  return useStore(authStore)
}

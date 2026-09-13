import { api } from './client'

export interface TLoginPayload {
  email: string
  password: string
}

export interface TUserSession {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
}

export interface TAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: TUserSession
}

export const authApi = {
  login: async (payload: TLoginPayload): Promise<TAuthResponse> => {
    const res = await api.post<TAuthResponse>('/auth/login', payload)
    return res.data
  },
  refresh: async (): Promise<TAuthResponse> => {
    const res = await api.post<TAuthResponse>('/auth/refresh')
    return res.data
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
  me: async (): Promise<TUserSession> => {
    const res = await api.get<TUserSession>('/auth/me')
    return res.data
  },
}

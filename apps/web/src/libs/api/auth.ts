import { api } from './client'

export interface TLoginPayload {
  email: string
  password: string
}

export interface TAuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface TUserSession {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
}

export const authApi = {
  login: async (payload: TLoginPayload): Promise<TAuthTokens> => {
    const res = await api.post<TAuthTokens>('/auth/login', payload)
    return res.data
  },
  me: async (): Promise<TUserSession> => {
    const res = await api.get<TUserSession>('/auth/me')
    return res.data
  },
}

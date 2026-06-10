import { apiRequest, getApiBaseUrl } from './apiClient'
import type { AuthUser } from '../types/auth'

export const authApi = {
  getCurrentUser: () => apiRequest<AuthUser>('/api/auth/me'),

  signInWithGoogle: () => {
    const returnUrl = window.location.href
    window.location.assign(
      `${getApiBaseUrl()}/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`,
    )
  },

  signOut: () =>
    apiRequest<void>('/api/auth/logout', {
      method: 'POST',
    }),
}

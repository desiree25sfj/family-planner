import { apiRequest } from './apiClient'
import type { Household, HouseholdInvitation } from '../types/household'

export const householdApi = {
  getCurrent: () => apiRequest<Household>('/api/households/current'),

  createInvitation: () =>
    apiRequest<HouseholdInvitation>('/api/households/current/invitations', {
      method: 'POST',
    }),

  acceptInvitation: (token: string) =>
    apiRequest<Household>('/api/households/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
}

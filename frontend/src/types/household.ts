export type HouseholdMember = {
  userId: number
  email: string
  displayName: string
  avatarUrl: string | null
  role: 'Owner' | 'Member'
  joinedAtUtc: string
}

export type Household = {
  id: number
  name: string
  currentUserRole: 'Owner' | 'Member'
  members: HouseholdMember[]
}

export type HouseholdInvitation = {
  inviteUrl: string
  expiresAtUtc: string
}

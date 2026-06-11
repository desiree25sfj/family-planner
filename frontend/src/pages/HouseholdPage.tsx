import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { householdApi } from '../services/householdApi'
import { getApiErrorMessage } from '../services/apiClient'
import type { Household, HouseholdInvitation } from '../types/household'

export function HouseholdPage() {
  const [household, setHousehold] = useState<Household | null>(null)
  const [invitation, setInvitation] = useState<HouseholdInvitation | null>(null)
  const [statusMessage, setStatusMessage] = useState('Loading household...')
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)

  useEffect(() => {
    loadHousehold()
  }, [])

  async function loadHousehold() {
    try {
      setHousehold(await householdApi.getCurrent())
      setStatusMessage('')
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error, 'Could not load household.'))
    }
  }

  async function createInvitation() {
    try {
      setIsCreatingInvite(true)
      setInvitation(await householdApi.createInvitation())
      setStatusMessage('')
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error, 'Could not create invitation.'))
    } finally {
      setIsCreatingInvite(false)
    }
  }

  const isOwner = household?.currentUserRole === 'Owner'

  return (
    <section>
      <PageHeader
        title="Household"
        description="Manage the people who share meal plans, recipes, and groceries."
      />

      {statusMessage && (
        <div className="mb-5 rounded-xl border border-marigold/30 bg-marigold/10 px-4 py-3 text-sm text-ink">
          {statusMessage}
        </div>
      )}

      {household && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="card card-pad">
            <div className="border-b border-oat pb-4">
              <p className="eyebrow">Current Household</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">{household.name}</h2>
              <p className="mt-2 text-sm text-muted">
                Your role: {household.currentUserRole}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {household.members.map((member) => (
                <article
                  key={member.userId}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-oat bg-paper/60 p-3"
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sm font-semibold text-sage">
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{member.displayName}</p>
                    <p className="truncate text-sm text-muted">{member.email}</p>
                  </div>
                  <span className="rounded-md bg-sage/10 px-2 py-1 text-xs font-semibold text-ink">
                    {member.role}
                  </span>
                </article>
              ))}
            </div>
          </div>

          <aside className="card card-pad">
            <h2 className="font-semibold text-ink">Invite someone</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Invitation links expire after seven days and can only be used once.
            </p>

            <button
              type="button"
              onClick={createInvitation}
              disabled={!isOwner || isCreatingInvite}
              className="btn-primary mt-4 w-full"
            >
              {isCreatingInvite ? 'Creating...' : 'Create invite link'}
            </button>

            {!isOwner && (
              <p className="mt-3 text-sm leading-6 text-muted">
                Only household owners can create invitations.
              </p>
            )}

            {invitation && (
              <div className="mt-4 rounded-lg border border-oat bg-paper/70 p-3">
                <label className="field-label" htmlFor="invite-url">
                  Invite link
                </label>
                <input
                  id="invite-url"
                  readOnly
                  value={invitation.inviteUrl}
                  className="field"
                  onFocus={(event) => event.target.select()}
                />
                <p className="mt-2 text-xs leading-5 text-muted">
                  Expires {new Date(invitation.expiresAtUtc).toLocaleString()}.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  )
}

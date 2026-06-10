import { authApi } from '../services/authApi'

type SignInPageProps = {
  statusMessage?: string
}

export function SignInPage({ statusMessage }: SignInPageProps) {
  return (
    <main className="min-h-screen bg-paper px-3 py-8 text-ink sm:px-6">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <div className="card card-pad w-full">
          <p className="eyebrow">Family Planner</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Sign in to plan dinners
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Use your Google account to keep your meals, week plan, and grocery list tied
            to your household.
          </p>

          {statusMessage && (
            <div className="mt-5 rounded-xl border border-marigold/30 bg-marigold/10 px-4 py-3 text-sm text-ink">
              {statusMessage}
            </div>
          )}

          <button
            type="button"
            onClick={authApi.signInWithGoogle}
            className="btn-primary mt-6 w-full"
          >
            Sign in with Google
          </button>
        </div>
      </section>
    </main>
  )
}

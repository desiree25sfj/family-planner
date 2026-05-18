type PageHeaderProps = {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-5">
      <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
        {description}
      </p>
    </header>
  )
}

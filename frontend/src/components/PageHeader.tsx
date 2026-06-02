type PageHeaderProps = {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-7">
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
        {description}
      </p>
    </header>
  )
}

type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="text-sm text-slate-600 sm:text-base">
        {description}
      </p>
    </header>
  );
}

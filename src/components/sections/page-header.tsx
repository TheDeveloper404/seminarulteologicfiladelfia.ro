interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-muted/50">
      <div className="mx-auto max-w-[100rem] px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

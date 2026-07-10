import type * as React from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[1.7rem] font-semibold tracking-normal text-notion-text sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-notion-muted">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </header>
  );
}

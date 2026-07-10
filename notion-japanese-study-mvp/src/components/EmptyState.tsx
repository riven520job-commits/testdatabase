import type * as React from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 h-12 w-12 rounded-2xl border border-notion-border bg-notion-soft" />
      <h2 className="text-lg font-semibold text-notion-text">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-notion-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

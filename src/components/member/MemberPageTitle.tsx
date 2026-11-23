import type { ReactNode } from "react";

export function MemberPageTitle({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl text-primary md:text-4xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-muted-foreground">{text}</p>}
      </div>
      {action}
    </div>
  );
}

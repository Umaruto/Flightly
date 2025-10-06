import type { ReactNode } from "react";

export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-6xl mx-auto px-4 ${className}`}>{children}</div>
  );
}

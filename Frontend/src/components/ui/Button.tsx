import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const base =
  "inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
const sizes = {
  sm: "px-2.5 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};
const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-700",
  outline:
    "border border-slate-300 text-slate-800 hover:bg-slate-50 focus:ring-slate-300",
};

export default function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
}

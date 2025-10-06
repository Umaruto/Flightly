import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helpText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export default function Input({
  label,
  helpText,
  error,
  leftIcon,
  rightIcon,
  className = "",
  id,
  ...rest
}: Props) {
  const inputId = id || `inp-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-600"
        >
          {label}
        </label>
      )}
      <div
        className={`mt-1 flex items-center gap-2 rounded border px-3 ${
          error
            ? "border-red-400 ring-1 ring-red-200"
            : "border-slate-300 focus-within:ring-1 focus-within:ring-blue-200"
        }`}
      >
        {leftIcon && <span className="text-slate-500">{leftIcon}</span>}
        <input
          id={inputId}
          className="w-full py-2 outline-none bg-transparent"
          {...rest}
        />
        {rightIcon && <span className="text-slate-500">{rightIcon}</span>}
      </div>
      {error ? (
        <div className="mt-1 text-xs text-red-600">{error}</div>
      ) : helpText ? (
        <div className="mt-1 text-xs text-slate-500">{helpText}</div>
      ) : null}
    </div>
  );
}

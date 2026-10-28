import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      containerClassName = "",
      labelClassName = "",
      inputClassName = "",
      id,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    const baseInput = [
      "w-full rounded-xl border px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 dark:bg-slate-900",
      "placeholder:text-slate-400 outline-none transition-all duration-200",
      "focus:ring-2 focus:ring-primary/30 focus:border-primary",
      leftIcon ? "pl-10" : "",
      rightIcon ? "pr-10" : "",
      error
        ? "border-red-400 focus:ring-red-300 focus:border-red-400"
        : "border-slate-200 dark:border-slate-800 hover:border-slate-300",
      disabled ? "bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed" : "",
      inputClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${labelClassName}`}
          >
            {label}
            {rest.required && (
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {leftIcon && (
            <span className="absolute left-3 flex items-center text-slate-400 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={baseInput}
            {...rest}
          />

          {/* Right icon — clickable if handler provided */}
          {rightIcon && (
            <span
              className={`absolute right-3 flex items-center text-slate-400 ${
                onRightIconClick
                  ? "cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                  : "pointer-events-none"
              }`}
              onClick={onRightIconClick}
              aria-hidden={!onRightIconClick}
              role={onRightIconClick ? "button" : undefined}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="flex items-center gap-1 text-xs font-medium text-red-500"
          >
            <span className="material-symbols-outlined text-sm leading-none">
              error
            </span>
            {error}
          </p>
        )}

        {/* Hint text — only shown when no error */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-400">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";

export default TextInput;

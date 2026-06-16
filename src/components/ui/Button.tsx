import React from "react";
import type { ButtonHTMLAttributes } from "react";
import { useLocale } from "../../contexts/LocaleContext";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  className = "",
  disabled,
  ...props
}) => {
  const { t } = useLocale();
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer dark:focus-visible:ring-offset-[#0d1117]";

  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400",
    secondary:
      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 focus-visible:ring-indigo-500 dark:bg-[#161b22] dark:hover:bg-[#1c222b] dark:text-gray-200 dark:border-gray-800",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 focus-visible:ring-gray-400 dark:hover:bg-white/5 dark:text-gray-300 dark:hover:text-white",
    danger:
      "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-400",
    outline:
      "bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300 focus-visible:ring-indigo-500 dark:hover:bg-white/5 dark:text-gray-200 dark:border-gray-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ms-1 me-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {t("Loading...")}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;

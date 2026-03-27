import React from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-4 py-2 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-all duration-200 shadow-sm
          disabled:bg-gray-50 disabled:text-gray-500
          dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100
          dark:focus:ring-indigo-400 dark:disabled:bg-gray-900 dark:disabled:text-gray-500
          dark:placeholder-gray-500
          ${error ? "border-red-300 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-400" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;

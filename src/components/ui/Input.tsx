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
          w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500
          transition-colors duration-150
          placeholder:text-gray-400
          disabled:bg-gray-50 disabled:text-gray-500
          dark:border-gray-700 dark:bg-[#0d1117] dark:text-gray-100
          dark:focus:ring-indigo-400/50 dark:focus:border-indigo-400
          dark:disabled:bg-gray-900 dark:disabled:text-gray-500
          dark:placeholder:text-gray-500
          ${error ? "border-red-400 focus:ring-red-500/60 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-400/50" : ""}
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

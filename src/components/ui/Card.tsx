import React from "react";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  footer?: ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  footer,
}) => {
  return (
    <div className={`glass-card rounded-xl overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 dark:bg-white/[0.02] dark:border-gray-800">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

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
    <div className={`glass-card rounded-2xl overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 dark:bg-gray-800/50 dark:border-gray-800">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

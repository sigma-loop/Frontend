import React from "react";
import { Link } from "react-router-dom";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  to?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, to, icon }) => {
  const inner = (
    <div className="glass-card rounded-xl p-5 h-full transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        {icon && (
          <span className="icon-tile h-9 w-9">{icon}</span>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>
      )}
    </div>
  );

  if (to)
    return (
      <Link to={to} className="block">
        {inner}
      </Link>
    );
  return inner;
};

export default StatCard;

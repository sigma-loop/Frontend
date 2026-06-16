import React from "react";
import Badge from "../../../components/ui/Badge";
import {
  formatDate,
  formatRelativeTime,
  truncate,
} from "../../../utils/formatters";
import type { AdminColumn } from "../../../constants/adminResources";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

/** Map a status / kind / enum value to a Badge colour. */
export function badgeVariant(value: string): BadgeVariant {
  const v = String(value).toUpperCase();
  if (["PASSED", "READY", "COMPLETED", "TRUE"].includes(v)) return "success";
  if (["FAILED", "ERROR"].includes(v)) return "error";
  if (
    [
      "PENDING",
      "GENERATING",
      "RUNNING",
      "STUB",
      "PENDING_REVIEW",
      "FALSE",
    ].includes(v)
  )
    return "warning";
  if (
    [
      "ADMIN",
      "PROGRAMMING",
      "MATH",
      "MCQ",
      "NEW_COURSE",
      "EXTEND_COURSE",
      "ASSISTANT",
      "USER",
      "SYSTEM",
      "GENERAL",
      "COURSE",
      "LESSON",
    ].includes(v)
  )
    return "info";
  return "default";
}

export function shortId(id: unknown): string {
  const s = String(id ?? "");
  return s.length > 10 ? "…" + s.slice(-6) : s;
}

/** Render a (possibly populated) reference field as a readable label. */
export function refValue(value: unknown, field = "email"): string {
  if (value == null) return "—";
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return String(
      obj[field] ?? obj.title ?? obj.name ?? obj.email ?? shortId(obj._id)
    );
  }
  return shortId(value);
}

/** The id behind a reference field, whether it's populated or a raw id. */
export function refId(value: unknown): string {
  if (value && typeof value === "object") {
    return String((value as Record<string, unknown>)._id ?? "");
  }
  return String(value ?? "");
}

const dash = <span className="text-gray-400">—</span>;

/** Render one table cell for the generic explorer. */
export function renderCell(
  item: Record<string, unknown>,
  col: AdminColumn
): React.ReactNode {
  const value = item[col.key];
  switch (col.kind) {
    case "badge":
      return value == null ? (
        dash
      ) : (
        <Badge variant={badgeVariant(String(value))}>{String(value)}</Badge>
      );
    case "date":
      return value ? formatDate(String(value)) : dash;
    case "rel":
      return value ? formatRelativeTime(String(value)) : dash;
    case "bool":
      return (
        <Badge variant={value ? "success" : "warning"}>
          {value ? "Yes" : "No"}
        </Badge>
      );
    case "id":
      return (
        <code className="text-xs text-gray-500 dark:text-gray-400">
          {shortId(value)}
        </code>
      );
    case "ref":
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {refValue(value, col.refField)}
        </span>
      );
    case "truncate":
      return (
        <span className="text-gray-600 dark:text-gray-400">
          {value ? truncate(String(value), 70) : "—"}
        </span>
      );
    default:
      return value == null || value === "" ? (
        dash
      ) : (
        <span className="text-gray-700 dark:text-gray-300">
          {String(value)}
        </span>
      );
  }
}

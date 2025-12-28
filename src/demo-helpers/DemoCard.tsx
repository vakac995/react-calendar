import type { ReactNode, ReactElement } from "react";
import { CopyButton } from "./CopyButton";

interface DemoCardProps {
  /** Demo title */
  title: string;
  /** Optional description */
  description?: string;
  /** Demo content (calendar component) */
  children: ReactNode;
  /** Code example to display */
  code: string;
  /** Optional badge text (e.g., "New", "Popular") */
  badge?: string;
  /** Badge color variant */
  badgeVariant?: "blue" | "green" | "orange" | "purple";
}

const badgeColors = {
  blue: "bg-blue-500/20 text-blue-300",
  green: "bg-green-500/20 text-green-300",
  orange: "bg-orange-500/20 text-orange-300",
  purple: "bg-purple-500/20 text-purple-300",
} as const;

/**
 * Card container for demo examples.
 * Displays title, description, calendar component, and code example.
 */
export function DemoCard({
  title,
  description,
  children,
  code,
  badge,
  badgeVariant = "blue",
}: DemoCardProps): ReactElement {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {badge && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColors[badgeVariant]}`}
            >
              {badge}
            </span>
          )}
        </div>
        {description && <p className="mt-0.5 text-sm text-blue-100">{description}</p>}
      </div>

      <div className="flex flex-col">
        {/* Calendar Section */}
        <div className="flex flex-col items-center border-b border-gray-100 p-5">
          <div>{children}</div>
        </div>

        {/* Code Section */}
        <div className="bg-slate-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Usage
            </span>
            <CopyButton text={code} />
          </div>
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-slate-300">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

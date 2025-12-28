import type { ReactNode, ReactElement } from "react";

interface DemoSectionProps {
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Emoji or icon to display */
  icon?: string;
  /** Section ID for anchor links */
  id?: string;
  /** Child demo cards */
  children: ReactNode;
}

/**
 * Section header for grouping related demo cards.
 * Provides visual separation and navigation anchors.
 */
export function DemoSection({
  title,
  description,
  icon,
  id,
  children,
}: DemoSectionProps): ReactElement {
  return (
    <section id={id} className="scroll-mt-20">
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3">
        {icon && <span className="text-3xl">{icon}</span>}
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {description && <p className="text-slate-400">{description}</p>}
        </div>
      </div>

      {/* Demo Cards */}
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

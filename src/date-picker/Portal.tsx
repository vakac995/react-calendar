import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { PortalProps } from "../types/date-picker.types";

/**
 * Portal component for rendering children outside the DOM hierarchy
 * Uses React's createPortal to render content in a different part of the DOM
 */
export function Portal({
  children,
  container,
  disabled = false,
}: PortalProps): React.ReactPortal | React.ReactElement | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // If disabled, render children in place
  if (disabled) {
    return <>{children}</>;
  }

  // Wait for mount before creating portal (SSR safety)
  if (!mounted) {
    return null;
  }

  // Use provided container or default to document.body
  const portalContainer = container ?? document.body;

  return createPortal(children, portalContainer);
}

Portal.displayName = "Portal";

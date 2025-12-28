import { useState, useCallback, type ReactElement } from "react";

/** SVG icon for copy action */
function CopyIcon(): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
  );
}

/** SVG icon for success state */
function CheckIcon(): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-green-400"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Duration to show success state (ms) */
  successDuration?: number;
  /** Custom class name */
  className?: string;
}

/**
 * Button that copies text to clipboard with visual feedback.
 */
export function CopyButton({
  text,
  successDuration = 2000,
  className = "",
}: CopyButtonProps): ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((): void => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), successDuration);
      })
      .catch((err: unknown) => {
        console.error("Failed to copy:", err);
      });
  }, [text, successDuration]);

  return (
    <button
      onClick={handleCopy}
      className={`rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white ${className}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
      aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

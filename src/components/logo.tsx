import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z" />
      <path d="M12 15a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z" />
      <path d="m12 9-1-1" />
      <path d="m15 12-1-1" />
      <path d="m9 12-1-1" />
    </svg>
  );
}

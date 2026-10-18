import { cn } from "@/lib/utils/cn";

/** Pojednostavljeni znakovi (oblačić + slušalica) u currentColor; nisu zvanični logotipi. */
export function ViberIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4.5", className)} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5c5.2 0 9.3 3.6 9.3 8.6 0 4.3-2.9 7.6-7 8.4v2.7c0 .4-.5.6-.8.3l-2.9-2.9h-.6C6.1 19.6 2.7 16 2.7 11.1S6.8 2.5 12 2.5Zm0 1.9c-4.2 0-7.4 2.9-7.4 6.7 0 3.9 2.8 6.7 6.6 6.9h.3l.4.1 1.9 1.9v-2l.8-.1c3.4-.5 5.8-3.2 5.8-6.8 0-3.8-3.2-6.7-7.4-6.7Zm-2.6 2.8c.3 0 .5.1.7.4l1 1.7c.2.3.1.6-.1.8l-.6.6c.5 1.1 1.4 2 2.5 2.5l.6-.6c.2-.2.6-.3.8-.1l1.7 1c.3.2.4.5.3.8-.3.9-1.2 1.5-2.1 1.3-2.8-.6-5-2.8-5.6-5.6-.2-.9.4-1.8 1.3-2.1l-.5-.7Z" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4.5", className)} fill="currentColor" aria-hidden="true">
      <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm0 1.9a7.9 7.9 0 0 1 0 15.8 7.8 7.8 0 0 1-4-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A7.9 7.9 0 0 1 12 4.1Zm-2.7 3.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.2 2.4.9 2.9.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.2-.7.1-.2.3-.8 1-1 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.5-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.5-.4-.5-.6-.5h-.4Z" />
    </svg>
  );
}

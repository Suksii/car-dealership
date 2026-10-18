import { cn } from "@/lib/utils/cn";

/** Bazni skeleton blok; dimenzije i radius kroz className (npr. "h-4 w-24"). */
export default function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-neutral-200/70", className)} {...props} />;
}

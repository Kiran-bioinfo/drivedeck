// Minimal class-joiner used by the /components/ui primitives
// (same call signature as the shadcn cn helper, without the clsx deps).
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

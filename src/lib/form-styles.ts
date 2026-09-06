/**
 * One definition of what a form control looks like, so the header search, the
 * auth forms, the browse filters and the listing forms can't drift apart.
 * The fixed height is what lets a custom select trigger line up with a plain
 * input beside it. Compose with `cn()` for per-call tweaks.
 */
export const fieldClass =
  "flex h-10 w-full items-center border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

/** Same treatment for controls that grow with their content. */
export const textareaClass =
  "min-h-24 w-full border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

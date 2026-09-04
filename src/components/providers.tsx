"use client";

import { ThemeProvider } from "next-themes";

// Better Auth's React client keeps session state in a shared store, so no
// session provider is needed — theme is the only client provider we hang here.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

import { cacheLife } from "next/cache";

/**
 * The copyright year is the only moving part here, and it moves once a year.
 * Caching it keeps `new Date()` out of the render path — an unstable value
 * there would stop the whole layout shell from prerendering.
 */
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await currentYear();

  return (
    <footer className="border-t py-6">
      <div className="container text-center text-sm text-muted-foreground">
        © {year} Deskdrop — a student marketplace project.
      </div>
    </footer>
  );
}

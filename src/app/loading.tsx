/**
 * Creates the Suspense boundary between the prerendered shell (header, footer)
 * and page content that needs the request — a session, params, search params.
 * The shell is served immediately and this stands in until the page streams in.
 */
export default function Loading() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className="h-8 w-1/3 bg-muted" />
        <div className="h-4 w-1/2 bg-muted" />
        <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-video bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

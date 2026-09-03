import Link from "next/link";

export default function ListingNotFound() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Listing not found</h1>
      <p className="text-muted-foreground mb-6">
        The listing you're looking for doesn't exist or has been removed.
      </p>
      <Link href="/browse" className="text-primary hover:underline">
        Browse other listings
      </Link>
    </div>
  );
}
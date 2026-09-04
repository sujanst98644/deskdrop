import { prisma, type Prisma } from "@/db";
import { requireSession } from "@/lib/auth-guard";
import { formatRs } from "@/lib/utils";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderActions } from "@/components/orders/OrderActions";

export default async function OrdersPage() {
  const session = await requireSession();

  // Fetch orders where user is buyer or seller
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        { sellerId: session.user.id },
      ],
    },
    include: {
      listing: {
        include: {
          seller: true,
          category: true,
        },
      },
      buyer: true,
      seller: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const buying = orders.filter((o) => o.buyerId === session.user.id);
  const selling = orders.filter((o) => o.sellerId === session.user.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {/* Buying */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Buying</h2>
        {buying.length === 0 ? (
          <p className="text-muted-foreground">You haven&apos;t requested any items yet.</p>
        ) : (
          <div className="space-y-4">
            {buying.map((order) => (
              <OrderCard key={order.id} order={order} role="buyer" />
            ))}
          </div>
        )}
      </section>

      {/* Selling */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Selling</h2>
        {selling.length === 0 ? (
          <p className="text-muted-foreground">No one has requested your items yet.</p>
        ) : (
          <div className="space-y-4">
            {selling.map((order) => (
              <OrderCard key={order.id} order={order} role="seller" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// --- OrderCard component ---

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    listing: { include: { seller: true; category: true } };
    buyer: true;
    seller: true;
  };
}>;

function OrderCard({
  order,
  role,
}: {
  order: OrderWithDetails;
  role: "buyer" | "seller";
}) {
  const listing = order.listing;
  const otherUser = role === "buyer" ? order.seller : order.buyer;

  return (
    <div className="border border-border rounded-lg p-4 bg-card hover:shadow-sm transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>
          <div>
            <Link
              href={`/listings/${listing.id}`}
              className="font-medium hover:underline"
            >
              {listing.title}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatRs(listing.pricePaisa)} • {otherUser.name}
            </p>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OrderActions order={order} role={role} />
        </div>
      </div>
    </div>
  );
}
import { prisma, type Prisma } from "@/db";
import { requireSession } from "@/lib/auth-guard";
import { formatRs } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, PackageOpen, ShoppingBag, Store } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderActions } from "@/components/orders/OrderActions";
import { EmptyState } from "@/components/ui/empty-state";

const tabs = [
  { id: "buying", label: "Buying", icon: ShoppingBag },
  { id: "selling", label: "Selling", icon: Store },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireSession();
  const { tab } = await searchParams;

  // The tab lives in the URL so the page stays a server component and each
  // view is linkable.
  const activeTab: TabId = tab === "selling" ? "selling" : "buying";

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
    },
    include: {
      listing: { include: { seller: true, category: true } },
      buyer: true,
      seller: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const byTab = {
    buying: orders.filter((order) => order.buyerId === session.user.id),
    selling: orders.filter((order) => order.sellerId === session.user.id),
  };
  const visible = byTab[activeTab];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">My orders</h1>

      <div className="mt-6 flex gap-6 border-b border-border">
        {tabs.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <Link
              key={item.id}
              href={`/dashboard/orders?tab=${item.id}`}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
              <span
                className={`px-1.5 py-0.5 text-xs ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {byTab[item.id].length}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        {visible.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title={
              activeTab === "buying"
                ? "You haven't requested any items yet"
                : "No one has requested your items yet"
            }
            description={
              activeTab === "buying"
                ? "Requests you send to sellers will show up here."
                : "When a buyer requests one of your listings, it lands here."
            }
          />
        ) : (
          <div className="space-y-4">
            {visible.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                role={activeTab === "buying" ? "buyer" : "seller"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="border border-border bg-card p-4 transition-shadow hover:shadow-2xs">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
            {listing.images?.[0] ? (
              <Image
                src={listing.images[0]}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageOff className="size-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/listings/${listing.id}`}
              className="font-medium hover:underline"
            >
              {listing.title}
            </Link>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatRs(listing.pricePaisa)} ·{" "}
              {role === "buyer" ? "from" : "for"} {otherUser.name}
            </p>
            <div className="mt-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OrderActions order={order} role={role} />
        </div>
      </div>
    </div>
  );
}

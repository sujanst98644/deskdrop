import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MessagesNavLink } from "@/components/layout/MessagesNavLink";
import { UnreadMessagesNav } from "@/components/layout/UnreadMessagesNav";
import { getCategories } from "@/lib/categories";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deskdrop — Student Marketplace",
  description: "Buy and sell items with fellow students.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cached, so it belongs to the static shell rather than costing a query on
  // every page view. The unread badge is the only part of the header that needs
  // the request itself, and it streams in behind its own boundary.
  const categories = await getCategories();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header
            categories={categories}
            messagesNav={
              <Suspense fallback={<MessagesNavLink />}>
                <UnreadMessagesNav />
              </Suspense>
            }
          />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

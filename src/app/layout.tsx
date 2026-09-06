import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { prisma } from "@/db";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth-guard";
import { countUnreadConversations } from "@/lib/messages";

// The layout reads categories from the database on every render, so nothing
// under it can be statically prerendered at build time.
export const dynamic = "force-dynamic";

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
  const [categories, session] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getSession(),
  ]);

  const unreadMessages = session?.user?.id
    ? await countUnreadConversations(session.user.id)
    : 0;

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header categories={categories} unreadMessages={unreadMessages} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

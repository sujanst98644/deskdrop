import Link from "next/link";
import { ArrowRight, ListPlus, MessagesSquare, Handshake } from "lucide-react";

const steps = [
  {
    icon: ListPlus,
    title: "List it in minutes",
    body: "Snap a photo, set a price, publish. No listing fees and no cut taken when it sells.",
  },
  {
    icon: MessagesSquare,
    title: "Get an offer",
    body: "Students on your campus request the item. Accept the ones you want and ignore the rest.",
  },
  {
    icon: Handshake,
    title: "Meet and hand it over",
    body: "Swap somewhere public between lectures, then mark the order complete. That's it.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="container py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            Sold to someone in your own lecture hall
          </h2>
          <p className="mt-3 text-muted-foreground">
            No shipping labels, no payment holds, no waiting on a courier — just
            the person sitting three rows in front of you.
          </p>
        </div>

        {/* A 1px grid gap over the border colour draws the dividers, so the
            three steps read as one block rather than three floating cards. */}
        <ol className="mt-10 grid gap-px border border-border bg-border md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="bg-background p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                  <step.icon className="size-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/sell/new"
            className="bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            List your first item
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
          >
            Or see what&apos;s for sale
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

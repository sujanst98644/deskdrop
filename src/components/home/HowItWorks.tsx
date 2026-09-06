import { ListPlus, MessagesSquare, Handshake } from "lucide-react";

const steps = [
  {
    icon: ListPlus,
    title: "List it or find it",
    body: "Put up what you no longer use in a couple of minutes, or browse what other students already have for sale. No listing fees, no cut when it sells.",
  },
  {
    icon: MessagesSquare,
    title: "Message the seller",
    body: "Ask whether it's still going, agree on a price, and work out the details — every listing gets its own thread, so nothing gets lost.",
  },
  {
    icon: Handshake,
    title: "Sort out the handover",
    body: "Meet somewhere public if you're nearby, or arrange delivery between you. Pay however suits you both, then mark the order complete.",
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
            Student to student, start to finish
          </h2>
          <p className="mt-3 text-muted-foreground">
            No middleman, no commission — the two of you agree the rest.
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
      </div>
    </section>
  );
}

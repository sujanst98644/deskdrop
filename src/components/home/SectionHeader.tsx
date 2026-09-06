import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  link?: string;
  linkText?: string;
}

export function SectionHeader({ title, subtitle, link, linkText }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {link && linkText && (
        <Link
          href={link}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          {linkText}
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  link?: string;
  linkText?: string;
}

export function SectionHeader({ title, subtitle, link, linkText }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between mb-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {link && linkText && (
        <Link href={link} className="text-sm text-primary hover:underline">
          {linkText} →
        </Link>
      )}
    </div>
  );
}
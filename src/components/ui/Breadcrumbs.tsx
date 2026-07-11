import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="breadcrumb" className="apex-breadcrumbs mb-3">
      <ol className="breadcrumb mb-0">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li
              key={`${item.label}-${i}`}
              className={`breadcrumb-item${isLast ? " active" : ""}`}
              {...(isLast ? { "aria-current": "page" as const } : {})}
            >
              {item.href && !isLast ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                item.label
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

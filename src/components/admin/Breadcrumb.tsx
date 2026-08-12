'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

/**
 * Breadcrumb dinâmico para exibir o caminho atual no painel.
 * Se 'items' for fornecido, usa eles. Caso contrário, usa o pathname.
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname();

  const displayItems: BreadcrumbItem[] =
    items ||
    pathname
      .split('/')
      .filter(Boolean)
      .map((segment, index, segments) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        return {
          label: segment,
          href,
        };
      });

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-600">
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;

        return (
          <div key={item.href || index} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />}

            {isLast || !item.href ? (
              <span className="font-medium text-gray-800 capitalize">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-[var(--lumilee-gold)] capitalize transition"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200 relative
        ${
          isActive
            ? 'bg-surface-700/80 text-text-primary'
            : 'text-text-muted hover:text-text-secondary hover:bg-surface-800/60'
        }
      `}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent-brand" />
      )}
      <span
        className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
          isActive
            ? 'text-accent-brand'
            : 'text-text-dim group-hover:text-text-muted'
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

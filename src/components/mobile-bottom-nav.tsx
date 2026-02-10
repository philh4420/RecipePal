
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, CalendarDays, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    href: '/recipes',
    label: 'Recipes',
    icon: UtensilsCrossed,
  },
  {
    href: '/meal-plan',
    label: 'Meal Plan',
    icon: CalendarDays,
  },
  {
    href: '/shopping-list',
    label: 'Shopping List',
    icon: ShoppingCart,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-border/70 bg-card/95 shadow-[0_-8px_22px_rgba(44,38,30,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid h-full max-w-lg grid-cols-3">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex flex-col items-center justify-center rounded-xl px-5 font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              <item.icon className="mb-1 h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

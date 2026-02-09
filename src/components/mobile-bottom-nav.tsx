
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
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border md:hidden">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-5 font-medium hover:bg-muted group',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import { Logo } from '@/components/logo';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, UtensilsCrossed, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import React from 'react';
import { UserButton } from '@/components/user-button';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

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

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
    <SidebarProvider>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="border-sidebar-border/90 bg-[linear-gradient(180deg,hsl(var(--sidebar-background)),hsl(103_24%_16%))] text-sidebar-foreground shadow-[0_24px_48px_rgba(9,8,5,0.32)]"
      >
        <SidebarHeader className="border-b border-sidebar-border/70 px-3 py-5">
          <Button variant="ghost" size="icon" className="shrink-0 size-10 rounded-xl bg-sidebar-accent/85 text-sidebar-primary shadow-[inset_0_1px_0_hsl(var(--sidebar-accent-foreground)/0.08)] hover:bg-sidebar-accent hover:text-sidebar-primary" asChild>
            <Link href="/recipes">
              <Logo className='size-5'/>
            </Link>
          </Button>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-headline font-semibold tracking-tight text-sidebar-foreground">RecipePal</span>
            <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-sidebar-foreground/65">Kitchen Companion</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-3">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  className="rounded-xl px-3 py-2 text-[15px] font-medium"
                  tooltip={{
                    children: item.label,
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border/70 px-3 py-3">
            <UserButton />
        </SidebarFooter>
      </Sidebar>
      <div className={cn("transition-[margin-left] duration-300 ease-in-out md:ml-[var(--sidebar-width-icon)] peer-data-[state=expanded]:md:ml-[var(--sidebar-width)]")}>
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border/60 bg-card px-4 shadow-[0_8px_16px_rgba(64,49,30,0.08)] backdrop-blur md:hidden">
            <h1 className="font-headline text-xl font-semibold tracking-tight">RecipePal</h1>
            <UserButton />
        </header>
        <SidebarInset className="mx-auto max-w-7xl p-4 pb-24 sm:p-6 lg:p-8 md:pb-8">
          {children}
        </SidebarInset>
      </div>
      <MobileBottomNav />
    </SidebarProvider>
  );
}

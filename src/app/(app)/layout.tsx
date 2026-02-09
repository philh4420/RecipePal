
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
  SidebarTrigger,
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
        className="border-sidebar-border text-sidebar-foreground"
      >
        <SidebarHeader>
          <Button variant="ghost" size="icon" className="shrink-0 size-10 flex items-center justify-center rounded-lg bg-primary/20 text-primary" asChild>
            <Link href="/recipes">
              <Logo className='size-5'/>
            </Link>
          </Button>
          <span className="text-lg font-semibold text-sidebar-foreground">RecipePal</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
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
        <SidebarFooter>
            <UserButton />
        </SidebarFooter>
      </Sidebar>
      <div className={cn("md:ml-[3rem]", "data-[state=expanded]:md:ml-[16rem]", "transition-[margin-left] duration-300 ease-in-out")}>
        <div className="absolute top-4 right-4 md:hidden">
            <SidebarTrigger />
        </div>
        <SidebarInset className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

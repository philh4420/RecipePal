
'use client';

import { useUser, useAuth } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useRouter } from 'next/navigation';

export function UserButton() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();


  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.replace('/login');
    }
  };

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border border-sidebar-border/70 bg-sidebar-accent/42 p-0 text-sidebar-foreground hover:bg-sidebar-accent/72 hover:text-sidebar-foreground"
        >
          <Avatar className="h-10 w-10 border border-sidebar-border/70">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              <UserIcon />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-xl border-border/90 bg-card text-card-foreground shadow-[0_24px_44px_rgba(7,5,3,0.32)]"
        align="start"
        side="top"
        sideOffset={10}
        forceMount
      >
        <DropdownMenuLabel className="font-normal text-foreground">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-foreground/70">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-foreground focus:bg-primary/12 focus:text-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

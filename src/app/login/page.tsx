
'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase/auth/use-user';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { user, loading } = useUser();

  React.useEffect(() => {
    if (!loading && user) {
      router.push('/recipes');
    }
  }, [user, loading, router]);


  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/recipes');
    } catch (error) {
      console.error('Error signing in with Google', error);
      // You might want to show a toast message here
    }
  };

  if (loading || user) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background">
         <Skeleton className="h-12 w-12" />
       </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center p-4">
        <Logo className="h-12 w-12" />
        <h1 className="text-3xl font-bold">Welcome to Crouton</h1>
        <p className="text-muted-foreground">
          Your modern companion for recipe management and meal planning.
        </p>
        <Button onClick={handleGoogleSignIn} size="lg">
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}


'use client';

import { Button } from '@/components/ui/button';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase/auth/use-user';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from '@/components/sign-in-form';
import { SignUpForm } from '@/components/sign-up-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createUserProfileDocument } from '@/lib/user';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, loading } = useUser();

  React.useEffect(() => {
    if (!loading && user) {
      router.push('/recipes');
    }
  }, [user, loading, router]);


  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Create user profile document on successful sign-in
      createUserProfileDocument(firestore, result.user);
      router.push('/recipes');
    } catch (error) {
      console.error('Error signing in with Google', error);
      // You might want to show a toast message here
    }
  };

  if (loading || user) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background">
         <div className="flex items-center justify-center h-screen">
          <Skeleton className="h-24 w-24" />
         </div>
       </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <Card className="w-full max-w-md">
        <CardHeader className="text-center">
           <div className="flex justify-center mb-4">
            <Logo className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">Welcome to RecipePal</CardTitle>
          <CardDescription>
            Sign in to save your recipes and plan your meals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
                <div className="pt-4">
                    <SignInForm />
                </div>
            </TabsContent>
            <TabsContent value="signup">
                <div className="pt-4">
                    <SignUpForm />
                </div>
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

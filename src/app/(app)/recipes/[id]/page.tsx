'use client';

import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Users, ChefHat } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { RecipeImage } from '@/components/recipe-image';

export default function RecipeDetailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const { id } = params;

  const recipeRef = useMemoFirebase(() => {
    if (!user || !firestore || !id) return null;
    return doc(firestore, 'users', user.uid, 'recipes', id as string);
  }, [firestore, user, id]);

  const { data: recipe, isLoading } = useDoc<Recipe>(recipeRef);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-96 w-full rounded-lg" />
        <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Recipe not found</h1>
        <p className="text-muted-foreground">This recipe may have been moved or deleted.</p>
      </div>
    );
  }
  const recipeName = typeof recipe.name === 'string' && recipe.name.trim() ? recipe.name : 'Untitled Recipe';
  
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-[0_22px_42px_rgba(51,39,27,0.12)] sm:p-8">
        <div className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-primary/18 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-accent/16 blur-3xl" />
        <h1 className="font-headline text-4xl font-semibold tracking-tight sm:text-5xl">{recipeName}</h1>
        {recipe.url && (
            <a href={recipe.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block break-all text-sm text-primary hover:underline">
                Original recipe source
            </a>
        )}
      </div>

      <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-border/60 shadow-2xl shadow-black/20">
         <RecipeImage
            src={recipe.imageUrl}
            alt={recipeName}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
        />
      </div>

       <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
          {recipe.prepTime && recipe.prepTime > 0 ? (
            <div className="flex items-center gap-2 rounded-full bg-muted/85 px-3 py-1.5">
              <Clock className="h-5 w-5" />
              <span>Prep: {recipe.prepTime} mins</span>
            </div>
          ) : null}
          {recipe.cookTime && recipe.cookTime > 0 ? (
             <div className="flex items-center gap-2 rounded-full bg-muted/85 px-3 py-1.5">
              <ChefHat className="h-5 w-5" />
              <span>Cook: {recipe.cookTime} mins</span>
            </div>
          ) : null}
          {recipe.servings && recipe.servings > 0 ? (
            <div className="flex items-center gap-2 rounded-full bg-muted/85 px-3 py-1.5">
              <Users className="h-5 w-5" />
              <span>Serves {recipe.servings}</span>
            </div>
          ): null}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 rounded-2xl border border-border/70 bg-card p-5 shadow-[0_12px_28px_rgba(49,39,30,0.12)]">
          <h2 className="mb-4 font-headline text-3xl font-semibold">Ingredients</h2>
          <ul className="list-disc list-inside space-y-2.5">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="ml-2">{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-border/70 bg-card p-6 shadow-[0_12px_28px_rgba(49,39,30,0.12)]">
          <h2 className="mb-4 font-headline text-3xl font-semibold">Instructions</h2>
          <div className="prose max-w-none whitespace-pre-line text-base leading-relaxed">
            {recipe.instructions}
          </div>
        </div>
      </div>
    </div>
  );
}

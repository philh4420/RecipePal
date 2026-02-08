'use client';

import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Users, ChefHat } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
  
  const imageUrl = recipe.imageUrl || PlaceHolderImages[0].imageUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{recipe.name}</h1>
        {recipe.url && (
            <a href={recipe.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                Original recipe source
            </a>
        )}
      </div>

      <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
         <Image
            src={imageUrl}
            alt={recipe.name}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
        />
      </div>

       <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
          {recipe.prepTime && recipe.prepTime > 0 ? (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Prep: {recipe.prepTime} mins</span>
            </div>
          ) : null}
          {recipe.cookTime && recipe.cookTime > 0 ? (
             <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              <span>Cook: {recipe.cookTime} mins</span>
            </div>
          ) : null}
          {recipe.servings && recipe.servings > 0 ? (
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Serves {recipe.servings}</span>
            </div>
          ): null}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
          <ul className="space-y-2.5 list-disc list-inside bg-card p-4 rounded-lg border shadow-sm">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="ml-2">{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Instructions</h2>
          <div className="prose max-w-none text-base whitespace-pre-line leading-relaxed">
            {recipe.instructions}
          </div>
        </div>
      </div>
    </div>
  );
}

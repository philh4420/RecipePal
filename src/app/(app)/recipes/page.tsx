'use client';

import { AddRecipeModal } from '@/components/add-recipe-modal';
import { RecipeCard } from '@/components/recipe-card';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader, Search, BookOpen, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { Button } from '@/components/ui/button';

export default function RecipesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [addModalOpen, setAddModalOpen] = React.useState(false);


  const recipesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'recipes');
  }, [firestore, user]);

  const { data: recipes, isLoading } = useCollection(recipesQuery);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">My Recipes</h1>
          <p className="text-muted-foreground">
            Your personal collection of delicious recipes.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
            <PlusCircle className="mr-2" />
            Add Recipe
        </Button>
        <AddRecipeModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search recipes..." className="pl-10" />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && recipes && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
       {!isLoading && recipes?.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Recipes Found</h2>
          <p className="mt-2 text-muted-foreground">Click "Add Recipe" to start your collection.</p>
        </div>
      )}
    </div>
  );
}

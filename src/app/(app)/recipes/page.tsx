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
import type { Recipe } from '@/lib/types';

export default function RecipesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');


  const recipesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'recipes');
  }, [firestore, user]);

  const { data: recipes, isLoading } = useCollection<Recipe>(recipesQuery);
  
  const filteredRecipes = React.useMemo(() => {
    if (!recipes) return [];
    return recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recipes, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">My Recipes</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your personal collection of delicious recipes.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Recipe
        </Button>
        <AddRecipeModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search recipes by name..." 
          className="pl-12 py-6 text-base" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-lg bg-card border overflow-hidden">
              <Skeleton className="h-[220px] w-full" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
       {!isLoading && filteredRecipes.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-24 border-2 border-dashed rounded-xl bg-card">
          <BookOpen className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-2xl font-semibold">No Recipes Found</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            {searchTerm ? `No recipes match "${searchTerm}".` : 'Click "Add Recipe" to start your collection.'}
          </p>
        </div>
      )}
    </div>
  );
}

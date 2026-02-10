'use client';

import { AddRecipeModal } from '@/components/add-recipe-modal';
import { RecipeCard } from '@/components/recipe-card';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Search, BookOpen, PlusCircle } from 'lucide-react';
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
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return recipes.filter((recipe): recipe is Recipe => {
      if (!recipe || typeof recipe !== 'object') return false;
      const recipeName = typeof recipe.name === 'string' ? recipe.name.toLowerCase() : '';
      return recipeName.includes(normalizedSearch);
    });
  }, [recipes, searchTerm]);

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--card))_52%,hsl(var(--secondary)/0.65)_100%)] p-6 shadow-[0_26px_48px_rgba(66,42,18,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -left-24 top-0 h-60 w-60 rounded-full bg-primary/24 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-60 w-60 rounded-full bg-accent/24 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,hsl(var(--accent)/0.12),transparent_35%)]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">My Kitchen Notebook</p>
            <h1 className="mt-3 font-headline text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">My Recipes</h1>
            <p className="mt-3 max-w-xl text-lg text-muted-foreground">
              Build your personal cookbook, import from the web, and keep everything ready for meal planning.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {filteredRecipes.length} recipe{filteredRecipes.length === 1 ? '' : 's'} in your collection
            </p>
          </div>
          <Button
            onClick={() => setAddModalOpen(true)}
            size="lg"
            className="self-start rounded-xl px-6 shadow-[0_16px_30px_hsl(var(--primary)/0.35)]"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Recipe
          </Button>
        </div>

        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipes by name..."
            className="h-12 rounded-xl border-border/75 bg-card pl-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <AddRecipeModal open={addModalOpen} onOpenChange={setAddModalOpen} />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4 overflow-hidden rounded-2xl border border-border/60 bg-card">
              <Skeleton className="h-[220px] w-full bg-muted/50" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-3/4 bg-muted/50" />
                <Skeleton className="h-4 w-1/2 bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
       {!isLoading && filteredRecipes.length === 0 && (
        <div className="relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/55 bg-card px-6 py-24 text-center shadow-[inset_0_1px_0_hsl(var(--background))]">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_60%_85%,hsl(var(--primary)/0.12),transparent_45%)]" />
          <BookOpen className="relative h-16 w-16 text-muted-foreground/75" />
          <h2 className="relative mt-6 text-2xl font-semibold">No Recipes Found</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            {searchTerm ? `No recipes match "${searchTerm}".` : 'Click "Add Recipe" to start your collection.'}
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { addRecipeToMealPlan } from '@/lib/meal-plan';
import type { Recipe } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import { Button } from './ui/button';
import { RecipeImage } from '@/components/recipe-image';

interface AddMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: Date | null;
  mealType: string | null;
  recipes: Recipe[];
}

export function AddMealModal({ open, onOpenChange, day, mealType, recipes }: AddMealModalProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const handleSelectRecipe = async (recipe: Recipe) => {
    if (!firestore || !user || !day || !mealType) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add recipe to meal plan. Missing required information.',
      });
      return;
    }
    setIsSaving(recipe.id);
    try {
      await addRecipeToMealPlan(firestore, user.uid, day, mealType.toLowerCase() as any, recipe.id);
      toast({
        title: 'Meal Added!',
        description: `${recipe.name} has been added to your ${mealType}.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add recipe to meal plan.',
      });
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-border/90 bg-[hsl(var(--card))] shadow-[0_36px_82px_rgba(12,10,8,0.5)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl tracking-tight">Add a recipe to your {mealType}</DialogTitle>
          <DialogDescription>
            Select one of your saved recipes to add to the meal plan.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] rounded-2xl border border-border/70 bg-muted/35 p-3">
          <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-card"
                onClick={() => !isSaving && handleSelectRecipe(recipe)}
              >
                <RecipeImage
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  width={200}
                  height={120}
                  className="w-full h-28 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-all group-hover:opacity-100">
                    {isSaving === recipe.id ? (
                        <Loader className="h-6 w-6 text-white animate-spin" />
                    ) : (
                        <Button variant="secondary" size="sm">Add to Plan</Button>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="truncate text-sm font-semibold text-white">{recipe.name}</h3>
                </div>
              </div>
            ))}
             {recipes.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-10">You don't have any recipes yet. Add some from the Recipes page!</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

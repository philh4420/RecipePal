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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import { Button } from './ui/button';

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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a recipe to your {mealType}</DialogTitle>
          <DialogDescription>
            Select one of your saved recipes to add to the meal plan.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="relative rounded-lg overflow-hidden border cursor-pointer group"
                onClick={() => !isSaving && handleSelectRecipe(recipe)}
              >
                <Image
                  src={recipe.imageUrl || PlaceHolderImages[0].imageUrl}
                  alt={recipe.name}
                  width={200}
                  height={120}
                  className="w-full h-28 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    {isSaving === recipe.id ? (
                        <Loader className="h-6 w-6 text-white animate-spin" />
                    ) : (
                        <Button variant="secondary" size="sm">Add to Plan</Button>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white text-sm font-semibold truncate">{recipe.name}</h3>
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

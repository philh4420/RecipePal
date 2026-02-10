'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { generateShoppingListAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader, ShoppingBasket, Sparkles } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { addDays, format, startOfWeek, endOfWeek } from 'date-fns';
import type { Recipe, MealPlanDocument } from '@/lib/types';
import type { AiRecipe } from '@/ai/types';
import { cn } from '@/lib/utils';

// Helper function to check if a line is a category header
const isCategoryHeader = (item: string) => {
    const categories = ["Produce", "Dairy & Eggs", "Meat & Seafood", "Pantry", "Bakery", "Frozen"];
    // A simple check to see if the item is one of the category titles.
    // The AI prompt guides the model to use these, but it might vary slightly.
    // A more robust check could use includes() or regex for partial matches.
    return categories.some(cat => item.trim().toLowerCase() === cat.trim().toLowerCase());
};


export function ShoppingListClient() {
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  // --- Data fetching logic ---
  const weekStartsOn = 1; // Monday
  const today = useMemo(() => new Date(), []);
  const startOfWeekDate = useMemo(() => startOfWeek(today, { weekStartsOn }), [today]);
  const endOfWeekDate = useMemo(() => endOfWeek(today, { weekStartsOn }), [today]);

  const mealPlansQuery = useMemoFirebase(() => {
    if (!user || !firestore || !startOfWeekDate || !endOfWeekDate) return null;
    return query(
      collection(firestore, 'users', user.uid, 'mealPlans'),
      where(documentId(), '>=', format(startOfWeekDate, 'yyyy-MM-dd')),
      where(documentId(), '<=', format(endOfWeekDate, 'yyyy-MM-dd'))
    );
  }, [firestore, user, startOfWeekDate, endOfWeekDate]);
  
  const { data: mealPlanDocs, isLoading: isLoadingMealPlans } = useCollection<MealPlanDocument>(mealPlansQuery);

  const recipeIds = useMemo(() => {
    if (!mealPlanDocs) return [];
    const ids = new Set<string>();
    mealPlanDocs.forEach(doc => {
      if (doc.breakfast) ids.add(doc.breakfast);
      if (doc.lunch) ids.add(doc.lunch);
      if (doc.dinner) ids.add(doc.dinner);
    });
    return Array.from(ids);
  }, [mealPlanDocs]);

  const recipesQuery = useMemoFirebase(() => {
    if (!user || !firestore || recipeIds.length === 0) return null;
    return query(collection(firestore, 'users', user.uid, 'recipes'), where(documentId(), 'in', recipeIds));
  }, [firestore, user, recipeIds]);

  const { data: recipes, isLoading: isLoadingRecipes } = useCollection<Recipe>(recipesQuery);
  // --- End data fetching logic ---


  const handleGenerate = () => {
    startTransition(async () => {
      if (!recipes || recipes.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No Recipes in Plan',
          description: "Add some meals to this week's plan to generate a shopping list.",
        });
        setShoppingList([]);
        return;
      }

      // Format for AI
      const aiRecipes: AiRecipe[] = recipes.map(r => ({
          name: r.name,
          ingredients: r.ingredients,
          servings: r.servings,
      }));

      const result = await generateShoppingListAction(aiRecipes);
      if (result.error || !result.shoppingList) {
        toast({
          variant: 'destructive',
          title: 'Error Generating List',
          description: result.error || "An unknown error occurred.",
        });
        setShoppingList([]);
      } else {
        setShoppingList(result.shoppingList);
        setCheckedItems({});
        if (result.shoppingList.length > 0) {
            toast({
                title: 'Shopping List Generated!',
                description: 'Your AI-powered, consolidated list is ready.',
            });
        }
      }
    });
  };

  const handleCheckboxChange = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };
  
  const isLoading = isPending || (isLoadingMealPlans && !mealPlanDocs) || (isLoadingRecipes && !recipes);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--card))_56%,hsl(var(--secondary)/0.58)_100%)] p-6 shadow-[0_24px_44px_rgba(51,39,27,0.14)] sm:p-8">
        <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-primary/18 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-52 w-52 rounded-full bg-accent/18 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Weekly Prep</p>
            <h1 className="mt-3 font-headline text-4xl font-semibold tracking-tight">Shopping List</h1>
            <p className="mt-2 text-muted-foreground">
              Generate a consolidated ingredient list from your meal plan and check items off as you shop.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="rounded-xl px-6">
            {isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate with AI
          </Button>
        </div>
      </div>

      <Card className="border-border/70 bg-card shadow-[0_14px_30px_rgba(58,45,34,0.14)]">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Your List</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader className="h-8 w-8 animate-spin mb-4" />
                <p>Analyzing your meal plan and generating list...</p>
            </div>
          ) : shoppingList.length > 0 ? (
            <div className="space-y-2">
              {shoppingList.map((item, index) => {
                const isCategory = isCategoryHeader(item);
                return (
                  <div key={index} className={cn(!isCategory && "flex items-center space-x-3 pl-2")}>
                    {isCategory ? (
                       <h3 className="mt-4 text-lg font-semibold text-primary first:mt-0">{item}</h3>
                    ) : (
                        <>
                            <Checkbox
                                id={`item-${index}`}
                                checked={checkedItems[item] || false}
                                onCheckedChange={() => handleCheckboxChange(item)}
                            />
                            <label
                                htmlFor={`item-${index}`}
                                className={`text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                                checkedItems[item] ? 'line-through text-muted-foreground' : ''
                                }`}
                            >
                                {item}
                            </label>
                       </>
                    )}
                  </div>
                );
            })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <ShoppingBasket className="h-10 w-10 mb-4" />
                <h3 className="text-lg font-semibold">Your list is empty</h3>
                <p className="text-sm">Click "Generate with AI" to get started.</p>
                <p className="text-xs mt-2">(Make sure you have recipes in your meal plan for this week)</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

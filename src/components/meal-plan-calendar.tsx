'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Plus, X } from 'lucide-react';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import type { Recipe, MealPlanDocument, DayPlan, Meal } from '@/lib/types';
import { addDays, format, startOfWeek, endOfWeek } from 'date-fns';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import React, { useState, useMemo, useEffect } from 'react';
import { AddMealModal } from './add-meal-modal';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from './ui/skeleton';
import { removeRecipeFromMealPlan } from '@/lib/meal-plan';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const MealCard = ({ meal, onRemove }: { meal: Meal; onRemove: () => void }) => (
  <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
    <CardContent className="p-0">
      <Image
        src={meal.recipe.imageUrl || PlaceHolderImages[0].imageUrl}
        alt={meal.recipe.name}
        width={300}
        height={150}
        className="h-24 w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
       <AlertDialog>
          <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <X className="h-4 w-4" />
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Remove from meal plan?</AlertDialogTitle>
              <AlertDialogDescription>
                  Are you sure you want to remove "{meal.recipe.name}" from this meal?
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove}>Remove</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      <div className="absolute bottom-0 p-2">
        <h3 className="text-xs font-semibold text-white leading-tight">
          {meal.recipe.name}
        </h3>
      </div>
    </CardContent>
  </Card>
);

const DayMeals = ({ day, dayPlan, onAdd, onRemove }: { day: Date; dayPlan: DayPlan; onAdd: (day: Date, mealType: string) => void; onRemove: (day: Date, mealType: string) => void; }) => {
    const mealTypes: Array<{ name: 'Breakfast'; key: 'breakfast' }, { name: 'Lunch'; key: 'lunch' }, { name: 'Dinner'; key: 'dinner' }> = ['Breakfast', 'Lunch', 'Dinner'].map(n => ({name: n, key: n.toLowerCase() as any}));

    return (
        <div className="space-y-4">
            {mealTypes.map((mealType) => {
            const meal = dayPlan[mealType.key];
            return (
                <Card key={mealType.name}>
                <CardHeader className="p-3">
                    <CardTitle className="text-sm font-medium">
                    {mealType.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    {meal ? (
                    <MealCard meal={meal} onRemove={() => onRemove(day, mealType.key)} />
                    ) : (
                    <Button variant="outline" className="w-full h-24 border-dashed" onClick={() => onAdd(day, mealType.name)}>
                        <Plus className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    )}
                </CardContent>
                </Card>
            );
            })}
        </div>
    );
};

const CalendarSkeleton = () => (
    <div className="grid grid-cols-7 gap-4 min-w-[800px]">
        {Array.from({length: 7}).map((_, i) => (
            <div key={i} className="space-y-4">
                <div className="text-center p-2 rounded-md">
                     <Skeleton className="h-7 w-12 mx-auto" />
                     <Skeleton className="h-5 w-8 mx-auto mt-1" />
                </div>
                <div className="space-y-4">
                    {Array.from({length: 3}).map((_, j) => (
                        <Card key={j}>
                             <CardHeader className="p-3">
                                <Skeleton className="h-5 w-20" />
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <Skeleton className="h-24 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        ))}
    </div>
);


export function MealPlanCalendar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const weekStartsOn = 1; // Monday
  
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setActiveTab(format(now, 'E'));
  }, []);

  const startOfWeekDate = useMemo(() => currentDate ? startOfWeek(currentDate, { weekStartsOn }) : null, [currentDate]);
  const endOfWeekDate = useMemo(() => currentDate ? endOfWeek(currentDate, { weekStartsOn }) : null, [currentDate]);
  const weekDays = useMemo(() => startOfWeekDate ? Array.from({ length: 7 }).map((_, i) => addDays(startOfWeekDate, i)) : [], [startOfWeekDate]);

  const [modalState, setModalState] = useState<{open: boolean, day: Date | null, mealType: string | null}>({open: false, day: null, mealType: null});

  const recipesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'recipes');
  }, [firestore, user]);
  const { data: recipes, isLoading: isLoadingRecipes } = useCollection<Recipe>(recipesQuery);

  const mealPlansQuery = useMemoFirebase(() => {
    if (!user || !firestore || !startOfWeekDate || !endOfWeekDate) return null;
    return query(
      collection(firestore, 'users', user.uid, 'mealPlans'),
      where(documentId(), '>=', format(startOfWeekDate, 'yyyy-MM-dd')),
      where(documentId(), '<=', format(endOfWeekDate, 'yyyy-MM-dd'))
    );
  }, [firestore, user, startOfWeekDate, endOfWeekDate]);

  const { data: mealPlanDocs, isLoading: isLoadingMealPlans } = useCollection<MealPlanDocument>(mealPlansQuery);

  const weekPlan = useMemo((): DayPlan[] => {
    return weekDays.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        if (isLoadingRecipes || isLoadingMealPlans || !recipes || !mealPlanDocs) {
            return { date: dayKey };
        }

        const recipesMap = new Map(recipes.map(r => [r.id, r]));
        const plansMap = new Map(mealPlanDocs.map(p => [p.id, p]));
        const planDoc = plansMap.get(dayKey);

        const getMeal = (recipeId: string | undefined | null): Meal | null => {
            if (!recipeId) return null;
            const recipe = recipesMap.get(recipeId);
            return recipe ? { recipe } : null;
        };

        return {
            date: dayKey,
            breakfast: getMeal(planDoc?.breakfast),
            lunch: getMeal(planDoc?.lunch),
            dinner: getMeal(planDoc?.dinner),
        };
    });
  }, [recipes, mealPlanDocs, weekDays, isLoadingRecipes, isLoadingMealPlans]);


  const handleAddMealClick = (day: Date, mealType: string) => {
    setModalState({ open: true, day, mealType });
  };

  const handleRemoveMeal = async (day: Date, mealType: string) => {
      if (!firestore || !user) return;
      try {
        await removeRecipeFromMealPlan(firestore, user.uid, day, mealType.toLowerCase() as any);
        toast({
            title: "Meal Removed",
            description: "The meal has been removed from your plan.",
        });
      } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to remove the meal. Please try again.",
        });
      }
  }

  const isLoading = isLoadingRecipes || isLoadingMealPlans || !currentDate;

  return (
    <div className="flex-1 space-y-8">
      <AddMealModal 
        open={modalState.open}
        onOpenChange={(open) => setModalState({...modalState, open})}
        day={modalState.day}
        mealType={modalState.mealType}
        recipes={recipes || []}
      />
      <h1 className="text-3xl font-bold tracking-tight">Meal Plan</h1>

      {/* Desktop View */}
      <div className="hidden md:block">
        <ScrollArea>
            {isLoading ? <CalendarSkeleton /> : (
                <div className="grid grid-cols-7 gap-4 min-w-[800px]">
                {weekDays.map((day, index) => (
                    <div key={day.toISOString()} className="space-y-4">
                    <div className="text-center p-2 rounded-md">
                        <p className="font-bold text-lg">{format(day, 'E')}</p>
                        <p className="text-sm text-muted-foreground">{format(day, 'd')}</p>
                    </div>
                    <DayMeals day={day} dayPlan={weekPlan[index]} onAdd={handleAddMealClick} onRemove={handleRemoveMeal} />
                    </div>
                ))}
                </div>
            )}
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <ScrollArea className="w-full whitespace-nowrap">
                <TabsList className="p-1 h-auto justify-start">
                    {weekDays.map(day => (
                        <TabsTrigger key={day.toISOString()} value={format(day, 'E')} className="flex-col h-auto py-2 px-4 data-[state=active]:shadow-md">
                            <span className="text-xs font-medium">{format(day, 'E')}</span>
                            <span className="text-base font-bold mt-1">{format(day, 'd')}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
             {isLoading ? <p className='py-10 text-center'>Loading meal plan...</p> : weekDays.map((day, index) => (
                <TabsContent key={day.toISOString()} value={format(day, 'E')} className="mt-6">
                    <DayMeals day={day} dayPlan={weekPlan[index]} onAdd={handleAddMealClick} onRemove={handleRemoveMeal} />
                </TabsContent>
            ))}
        </Tabs>
      </div>
    </div>
  );
}

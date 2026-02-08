'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Recipe } from '@/lib/types';
import { addDays, format, startOfWeek } from 'date-fns';
import { mealPlan } from '@/lib/data';
import Image from 'next/image';

const MealCard = ({ meal }: { meal: { recipe: Recipe } }) => (
  <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
    <CardContent className="p-0">
      <Image
        src={meal.recipe.image}
        alt={meal.recipe.name}
        width={300}
        height={150}
        className="h-24 w-full object-cover"
        data-ai-hint={meal.recipe.imageHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 p-2">
        <h3 className="text-xs font-semibold text-white leading-tight">
          {meal.recipe.name}
        </h3>
      </div>
    </CardContent>
  </Card>
);

export function MealPlanCalendar() {
  const weekStartsOn = 1; // Monday
  const today = new Date();
  const startOfWeekDate = startOfWeek(today, { weekStartsOn });
  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(startOfWeekDate, i)
  );

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  return (
    <div className="flex-1 space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Meal Plan</h1>
      <ScrollArea>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-[800px]">
          {weekDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayPlan = mealPlan[dayKey] || {};

            return (
              <div key={day.toISOString()} className="space-y-4">
                <div className="text-center">
                  <p className="font-bold text-lg">{format(day, 'E')}</p>
                  <p className="text-sm text-muted-foreground">{format(day, 'd')}</p>
                </div>
                <div className="space-y-4">
                  {mealTypes.map((mealType) => {
                    const meal = dayPlan[mealType.toLowerCase() as keyof typeof dayPlan];
                    return (
                      <Card key={mealType}>
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm font-medium">
                            {mealType}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          {meal ? (
                            <MealCard meal={meal} />
                          ) : (
                            <Button variant="outline" className="w-full h-24 border-dashed">
                              <Plus className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

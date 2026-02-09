'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Recipe } from '@/lib/types';
import { addDays, format, startOfWeek } from 'date-fns';
import { mealPlan } from '@/lib/data';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const DayMeals = ({ day }: { day: Date }) => {
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayPlan = mealPlan[dayKey] || {};

    return (
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
    );
};


export function MealPlanCalendar() {
  const weekStartsOn = 1; // Monday
  const today = new Date();
  const startOfWeekDate = startOfWeek(today, { weekStartsOn });
  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(startOfWeekDate, i)
  );

  const todayDayString = format(today, 'E');

  return (
    <div className="flex-1 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Meal Plan</h1>

      {/* Desktop View */}
      <div className="hidden md:block">
        <ScrollArea>
            <div className="grid grid-cols-7 gap-4 min-w-[800px]">
            {weekDays.map((day) => (
                <div key={day.toISOString()} className="space-y-4">
                <div className="text-center p-2 rounded-md">
                    <p className="font-bold text-lg">{format(day, 'E')}</p>
                    <p className="text-sm text-muted-foreground">{format(day, 'd')}</p>
                </div>
                <DayMeals day={day} />
                </div>
            ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <Tabs defaultValue={todayDayString} className="w-full">
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

             {weekDays.map(day => (
                <TabsContent key={day.toISOString()} value={format(day, 'E')} className="mt-6">
                    <DayMeals day={day} />
                </TabsContent>
            ))}
        </Tabs>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { getShoppingList } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader, ShoppingBasket, Sparkles } from 'lucide-react';

export function ShoppingListClient() {
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await getShoppingList();
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error Generating List',
          description: result.error,
        });
        setShoppingList([]);
      } else {
        setShoppingList(result.shoppingList || []);
        setCheckedItems({});
        toast({
          title: 'Shopping List Generated!',
          description: 'Your ingredients have been consolidated.',
        });
      }
    });
  };

  const handleCheckboxChange = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Shopping List</h1>
          <p className="text-muted-foreground">
            Generate a consolidated list of ingredients from your meal plan.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isPending} size="lg">
          {isPending ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your List</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader className="h-8 w-8 animate-spin mb-4" />
                <p>Generating your shopping list...</p>
            </div>
          ) : shoppingList.length > 0 ? (
            <div className="space-y-4">
              {shoppingList.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox
                    id={`item-${index}`}
                    checked={checkedItems[item] || false}
                    onCheckedChange={() => handleCheckboxChange(item)}
                  />
                  <label
                    htmlFor={`item-${index}`}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      checkedItems[item] ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {item}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <ShoppingBasket className="h-10 w-10 mb-4" />
                <h3 className="text-lg font-semibold">Your list is empty</h3>
                <p className="text-sm">Click "Generate List" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

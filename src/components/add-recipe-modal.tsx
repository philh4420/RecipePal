'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import React from 'react';

export function AddRecipeModal() {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would typically handle form submission,
    // e.g., send data to a server or update state.
    toast({
      title: 'Recipe Added!',
      description: 'Your new recipe has been saved successfully.',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add a New Recipe</DialogTitle>
          <DialogDescription>
            Import a recipe from a URL or enter it manually.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="import">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import from URL</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          <TabsContent value="import">
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="url">Recipe URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/your-favorite-recipe"
                />
              </div>
              <Button type="submit" className="w-full">
                Import Recipe
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="title">Recipe Title</Label>
                <Input id="title" placeholder="e.g., Classic Lasagna" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input id="servings" type="number" placeholder="e.g., 4" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients</Label>
                <Textarea
                  id="ingredients"
                  placeholder="e.g., 1 cup flour, 2 eggs, 1/2 tsp salt..."
                  className="min-h-[100px]"
                />
                 <p className="text-xs text-muted-foreground">Enter each ingredient on a new line.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Step-by-step instructions..."
                  className="min-h-[120px]"
                />
              </div>
              <Button type="submit" className="w-full">
                Save Recipe
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

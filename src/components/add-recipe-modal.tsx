'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { addRecipe, updateRecipe } from '@/lib/recipes';
import { useFirestore, useUser } from '@/firebase';
import { extractRecipeFromUrl } from '@/lib/actions';
import type { Recipe } from '@/lib/types';
import { cn } from '@/lib/utils';

const manualFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Title must be at least 3 characters.',
  }),
  servings: z.coerce.number().min(1, {
    message: 'Please enter at least 1 serving.',
  }),
  ingredients: z.string().min(10, {
    message: 'Please list the ingredients.',
  }),
  instructions: z.string().min(10, {
    message: 'Please provide the instructions.',
  }),
  prepTime: z.coerce.number().optional(),
  cookTime: z.coerce.number().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

const importFormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

interface RecipeModalProps {
  recipe?: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRecipeModal({ recipe, open, onOpenChange }: RecipeModalProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const isEditMode = !!recipe;

  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
  });

  React.useEffect(() => {
    if (open) {
      if (isEditMode && recipe) {
        manualForm.reset({
          name: recipe.name || '',
          servings: recipe.servings || 1,
          ingredients: recipe.ingredients ? recipe.ingredients.join('\n') : '',
          instructions: recipe.instructions || '',
          prepTime: recipe.prepTime || 0,
          cookTime: recipe.cookTime || 0,
          url: recipe.url || '',
        });
      } else {
        manualForm.reset({
          name: '',
          servings: 1,
          ingredients: '',
          instructions: '',
          prepTime: 0,
          cookTime: 0,
          url: '',
        });
      }
    }
  }, [open, recipe, isEditMode, manualForm]);

  const importForm = useForm<z.infer<typeof importFormSchema>>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      url: '',
    },
  });

  const handleManualSubmit = async (values: z.infer<typeof manualFormSchema>) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add a recipe.',
      });
      return;
    }
    setIsSaving(true);

    try {
      if (isEditMode && recipe) {
        updateRecipe(firestore, user.uid, recipe.id, values);
        toast({
          title: 'Recipe Updated!',
          description: 'Your recipe has been updated successfully.',
        });
      } else {
        await addRecipe(firestore, user.uid, values);
        toast({
          title: 'Recipe Added!',
          description: 'Your new recipe has been saved successfully.',
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Could not ${isEditMode ? 'update' : 'save'} recipe. Please try again.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportSubmit = async (values: z.infer<typeof importFormSchema>) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to import a recipe.',
      });
      return;
    }
    setIsImporting(true);
    setIsSaving(true);

    const result = await extractRecipeFromUrl(values.url);

    if (result.error || !result.recipe) {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: result.error || 'Could not extract recipe from the URL.',
      });
      setIsImporting(false);
      setIsSaving(false);
      return;
    }

    if (!result.recipe.imageUrl) {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: 'AI image generation failed for this recipe. Please try another URL.',
      });
      setIsImporting(false);
      setIsSaving(false);
      return;
    }

    try {
      await addRecipe(firestore, user.uid, { ...result.recipe, url: values.url }, { usePlaceholder: false });
      toast({
        title: 'Recipe Imported!',
        description: `${result.recipe.name} has been added to your collection.`,
      });
      importForm.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Saving Recipe',
        description: 'The recipe was imported but could not be saved. Please try again.',
      });
    } finally {
      setIsImporting(false);
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-[28px] border-border/90 bg-[hsl(var(--card))] shadow-[0_36px_82px_rgba(12,10,8,0.5)] sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl tracking-tight">{isEditMode ? 'Edit Recipe' : 'Add a New Recipe'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Make changes to your recipe below.' : 'Import a recipe from a URL or enter it manually.'}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="manual" value={isEditMode ? 'manual' : undefined} className="space-y-4">
          <TabsList className={cn('grid w-full rounded-xl bg-muted/80', isEditMode ? 'grid-cols-1' : 'grid-cols-2')}>
            {!isEditMode && <TabsTrigger value="import">Import from URL</TabsTrigger>}
            <TabsTrigger value="manual">{isEditMode ? 'Recipe Details' : 'Manual Entry'}</TabsTrigger>
          </TabsList>
          {!isEditMode && 
            <TabsContent value="import">
              <Form {...importForm}>
                <form onSubmit={importForm.handleSubmit(handleImportSubmit)} className="space-y-4 rounded-2xl border border-border/70 bg-muted/35 p-4">
                  <FormField
                    control={importForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/your-favorite-recipe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isImporting || isSaving}>
                    {isImporting ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Importing with AI...
                      </>
                    ) : (
                      'Import Recipe'
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          }
          <TabsContent value="manual">
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(handleManualSubmit)} className="max-h-[62vh] space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-muted/35 p-4 pr-3">
                <FormField
                  control={manualForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipe Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Classic Lasagna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={manualForm.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servings</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={manualForm.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingredients</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 1 cup flour, 2 eggs, 1/2 tsp salt..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each ingredient on a new line.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={manualForm.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Step-by-step instructions..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={manualForm.control}
                    name="prepTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prep Time (mins)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={manualForm.control}
                    name="cookTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cook Time (mins)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={manualForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/original-recipe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving && !isImporting ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isEditMode ? 'Update Recipe' : 'Save Recipe'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

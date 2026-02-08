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
import { PlusCircle, Loader, Sparkles } from 'lucide-react';
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
import { addRecipe } from '@/lib/recipes';
import { useFirestore, useUser } from '@/firebase';
import { extractRecipeFromUrl } from '@/lib/actions';

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
});

const importFormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

export function AddRecipeModal() {
  const [open, setOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: {
      name: '',
      servings: 1,
      ingredients: '',
      instructions: '',
    },
  });

  const importForm = useForm<z.infer<typeof importFormSchema>>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      url: '',
    },
  });

  const handleManualSubmit = (values: z.infer<typeof manualFormSchema>) => {
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
      addRecipe(firestore, user.uid, values);
      toast({
        title: 'Recipe Added!',
        description: 'Your new recipe has been saved successfully.',
      });
      manualForm.reset();
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save recipe. Please try again.',
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

    try {
      addRecipe(firestore, user.uid, { ...result.recipe, url: values.url });
      toast({
        title: 'Recipe Imported!',
        description: `${result.recipe.name} has been added to your collection.`,
      });
      importForm.reset();
      setOpen(false);
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
        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import from URL</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          <TabsContent value="import">
            <Form {...importForm}>
              <form onSubmit={importForm.handleSubmit(handleImportSubmit)} className="space-y-4 py-4">
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
          <TabsContent value="manual">
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(handleManualSubmit)} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
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
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving && !isImporting ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Recipe'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

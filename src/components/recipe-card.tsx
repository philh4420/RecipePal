'use client';

import type { Recipe } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './ui/button';
import { MoreHorizontal, Loader, Clock, ChefHat } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from 'next/link';
import React from 'react';
import { AddRecipeModal } from './add-recipe-modal';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { deleteRecipe } from '@/lib/recipes';
import { RecipeImage } from '@/components/recipe-image';


interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const recipeName = typeof recipe.name === 'string' && recipe.name.trim() ? recipe.name : 'Untitled Recipe';

  const handleDeleteConfirm = () => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to delete a recipe.',
      });
      return;
    }
    setIsDeleting(true);
    try {
      deleteRecipe(firestore, user.uid, recipe.id);
      toast({
        title: 'Recipe Deleted',
        description: `"${recipeName}" has been removed from your collection.`,
      });
      setDeleteDialogOpen(false);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the recipe. Please try again.',
      });
    } finally {
       setIsDeleting(false);
    }
  }


  return (
    <>
      <Card className="group flex h-full flex-col overflow-hidden border-border/70 bg-card/95 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_36px_rgba(64,53,40,0.16)]">
        <div className="relative">
           <Link href={`/recipes/${recipe.id}`} className="absolute inset-0 z-10" aria-label={`View ${recipeName}`}>
            <span className="sr-only">View Recipe</span>
           </Link>
           <RecipeImage
              src={recipe.imageUrl}
              alt={recipeName}
              width={400}
              height={225}
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
           <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
           <div className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            Recipe
           </div>
           <div className="absolute top-3 right-3 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-card/75 hover:bg-card backdrop-blur-sm shadow-md">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditModalOpen(true); }}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setDeleteDialogOpen(true); }} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardContent className="flex flex-grow flex-col p-5">
          <h3 className="flex-grow font-headline text-2xl font-semibold leading-tight text-foreground line-clamp-2">
             <Link href={`/recipes/${recipe.id}`} className="hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-ring rounded-sm">
              {recipeName}
             </Link>
          </h3>
        
          {(recipe.prepTime || recipe.cookTime) && (
            <div className="mt-auto flex items-center gap-3 pt-4 text-sm text-muted-foreground">
                {recipe.prepTime && recipe.prepTime > 0 ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prepTime} min</span>
                  </div>
                ) : null}
                {recipe.cookTime && recipe.cookTime > 0 ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                    <ChefHat className="h-4 w-4" />
                    <span>{recipe.cookTime} min</span>
                  </div>
                ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <AddRecipeModal recipe={recipe} open={editModalOpen} onOpenChange={setEditModalOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the recipe for "{recipeName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

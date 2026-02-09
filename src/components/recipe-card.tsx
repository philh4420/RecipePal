'use client';

import type { Recipe } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import React from 'react';
import { AddRecipeModal } from './add-recipe-modal';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { deleteRecipe } from '@/lib/recipes';


interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const imageUrl = recipe.imageUrl || PlaceHolderImages[0].imageUrl;
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

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
        description: `"${recipe.name}" has been removed from your collection.`,
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
      <Card className="h-full overflow-hidden flex flex-col group shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="relative">
           <Link href={`/recipes/${recipe.id}`} className="absolute inset-0 z-10" aria-label={`View ${recipe.name}`}>
            <span className="sr-only">View Recipe</span>
           </Link>
           <Image
              src={imageUrl}
              alt={recipe.name}
              width={400}
              height={225}
              className="aspect-video w-full object-cover"
            />
           <div className="absolute top-3 right-3 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm">
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
        <CardContent className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2 text-foreground flex-grow">
             <Link href={`/recipes/${recipe.id}`} className="hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-ring rounded-sm">
              {recipe.name}
             </Link>
          </h3>
        
          {(recipe.prepTime || recipe.cookTime) && (
            <div className="pt-4 mt-auto text-sm text-muted-foreground flex items-center gap-4">
                {recipe.prepTime && recipe.prepTime > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prepTime} min</span>
                  </div>
                ) : null}
                {recipe.cookTime && recipe.cookTime > 0 ? (
                  <div className="flex items-center gap-1.5">
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
              This action cannot be undone. This will permanently delete the recipe for "{recipe.name}".
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

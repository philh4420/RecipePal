'use client';

import { Recipe } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from './ui/button';
import { MoreHorizontal, Loader } from 'lucide-react';
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
      <div className="relative group">
        <Link href={`/recipes/${recipe.id}`} className="absolute inset-0 z-10" aria-label={`View ${recipe.name}`}>
          <span className="sr-only">View Recipe</span>
        </Link>
        <Card className="overflow-hidden h-full transition-shadow group-hover:shadow-lg">
          <CardHeader className="p-0 relative">
            <Image
              src={imageUrl}
              alt={recipe.name}
              width={400}
              height={250}
              className="aspect-[16/10] w-full object-cover"
            />
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
              {recipe.name}
            </CardTitle>
          </CardContent>
        </Card>
        <div className="absolute top-2 right-2 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white backdrop-blur-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditModalOpen(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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

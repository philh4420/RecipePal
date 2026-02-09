'use client';

import { collection, doc, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PlaceHolderImages } from './placeholder-images';

// A more flexible type for recipe data, accommodating both manual and imported recipes.
export interface RecipeData {
  name: string;
  servings?: number;
  ingredients: string[] | string; // Can be a string from textarea or string[] from AI
  instructions: string;
  prepTime?: number;
  cookTime?: number;
  url?: string;
  imageUrl?: string;
}

/**
 * Saves a new recipe to the user's subcollection in Firestore.
 * @param firestore The Firestore instance.
 * @param userId The ID of the current user.
 * @param recipeData The recipe data from the form or import.
 */
type AddRecipeOptions = {
  usePlaceholder?: boolean;
};

export function addRecipe(
  firestore: Firestore,
  userId: string,
  recipeData: RecipeData,
  options: AddRecipeOptions = {}
) {
  const recipesCollectionRef = collection(firestore, `users/${userId}/recipes`);

  const ingredientsArray = Array.isArray(recipeData.ingredients)
    ? recipeData.ingredients
    : recipeData.ingredients.split('\n').filter(line => line.trim() !== '');

  const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
  const usePlaceholder = options.usePlaceholder ?? true;
  const resolvedImageUrl = recipeData.imageUrl || (usePlaceholder ? randomImage.imageUrl : undefined);

  const newRecipe: Record<string, any> = {
    userId: userId,
    name: recipeData.name,
    servings: recipeData.servings || 1,
    ingredients: ingredientsArray,
    instructions: recipeData.instructions,
    prepTime: recipeData.prepTime || 0,
    cookTime: recipeData.cookTime || 0,
    url: recipeData.url || '',
  };

  if (resolvedImageUrl) {
    newRecipe.imageUrl = resolvedImageUrl;
  }

  // Returns a promise so callers can optionally await and handle write failures.
  return addDocumentNonBlocking(recipesCollectionRef, newRecipe);
}


/**
 * Updates an existing recipe in Firestore.
 * @param firestore The Firestore instance.
 * @param userId The ID of the current user.
 * @param recipeId The ID of the recipe to update.
 * @param recipeData The new data for the recipe.
 */
export function updateRecipe(firestore: Firestore, userId: string, recipeId: string, recipeData: Partial<RecipeData>) {
    const recipeDocRef = doc(firestore, `users/${userId}/recipes`, recipeId);

    // Create a mutable copy to work with
    const updateData: { [key: string]: any } = { ...recipeData };

    // Handle ingredient conversion if it's a string
    if (typeof updateData.ingredients === 'string') {
        updateData.ingredients = updateData.ingredients.split('\n').filter((line: string) => line.trim() !== '');
    }

    updateDocumentNonBlocking(recipeDocRef, updateData);
}


/**
 * Deletes a recipe from the user's subcollection in Firestore.
 * @param firestore The Firestore instance.
 * @param userId The ID of the current user.
 * @param recipeId The ID of the recipe to delete.
 */
export function deleteRecipe(firestore: Firestore, userId: string, recipeId: string) {
    const recipeDocRef = doc(firestore, `users/${userId}/recipes`, recipeId);
    deleteDocumentNonBlocking(recipeDocRef);
}

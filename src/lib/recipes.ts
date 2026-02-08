'use client';

import { collection, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PlaceHolderImages } from './placeholder-images';

// A more flexible type for recipe data, accommodating both manual and imported recipes.
interface RecipeData {
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
export function addRecipe(firestore: Firestore, userId: string, recipeData: RecipeData) {
  const recipesCollectionRef = collection(firestore, `users/${userId}/recipes`);

  const ingredientsArray = Array.isArray(recipeData.ingredients)
    ? recipeData.ingredients
    : recipeData.ingredients.split('\n').filter(line => line.trim() !== '');

  const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];

  const newRecipe = {
    userId: userId,
    name: recipeData.name,
    servings: recipeData.servings || 1,
    ingredients: ingredientsArray,
    instructions: recipeData.instructions,
    imageUrl: recipeData.imageUrl || randomImage.imageUrl,
    prepTime: recipeData.prepTime || 0,
    cookTime: recipeData.cookTime || 0,
    url: recipeData.url || '',
  };

  // Use the non-blocking fire-and-forget update
  addDocumentNonBlocking(recipesCollectionRef, newRecipe);
}

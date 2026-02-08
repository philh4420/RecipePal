'use client';

import { collection, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PlaceHolderImages } from './placeholder-images';

interface RecipeData {
  title: string;
  servings: number;
  ingredients: string;
  instructions: string;
}

/**
 * Saves a new recipe to the user's subcollection in Firestore.
 * @param firestore The Firestore instance.
 * @param userId The ID of the current user.
 * @param recipeData The recipe data from the form.
 */
export function addRecipe(firestore: Firestore, userId: string, recipeData: RecipeData) {
  const recipesCollectionRef = collection(firestore, `users/${userId}/recipes`);

  const ingredientsArray = recipeData.ingredients.split('\n').filter(line => line.trim() !== '');
  const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];


  const newRecipe = {
    userId: userId,
    name: recipeData.title,
    servings: recipeData.servings,
    ingredients: ingredientsArray,
    instructions: recipeData.instructions,
    imageUrl: randomImage.imageUrl,
    // Add default values for other fields for now
    prepTime: 30,
    cookTime: 60,
    url: '',
  };

  // Use the non-blocking fire-and-forget update
  addDocumentNonBlocking(recipesCollectionRef, newRecipe);
}

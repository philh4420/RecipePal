'use client';

import { doc, Firestore, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { format } from 'date-fns';
import type { MealPlanDocument } from './types';

type MealType = 'breakfast' | 'lunch' | 'dinner';

/**
 * Adds or updates a recipe for a specific meal in a user's meal plan.
 * It creates the meal plan document for the day if it doesn't exist.
 * @param firestore The Firestore instance.
 * @param userId The ID of the current user.
 * @param date The date of the meal.
 * @param mealType The type of the meal (breakfast, lunch, or dinner).
 * @param recipeId The ID of the recipe to add.
 */
export async function addRecipeToMealPlan(
  firestore: Firestore,
  userId: string,
  date: Date,
  mealType: MealType,
  recipeId: string
) {
  const dateString = format(date, 'yyyy-MM-dd');
  const mealPlanDocRef = doc(firestore, `users/${userId}/mealPlans`, dateString);

  const dataToSet: Partial<MealPlanDocument> & { userId: string, id: string } = {
    id: dateString,
    userId: userId,
    [mealType]: recipeId,
  };

  // Use set with merge to create the document or update the specific meal field.
  await setDoc(mealPlanDocRef, dataToSet, { merge: true });
}

/**
 * Removes a recipe from a specific meal in a user's meal plan.
 * @param firestore The Firestore instance.
 * @param userId The ID of the current user.
 * @param date The date of the meal.
 * @param mealType The type of the meal (breakfast, lunch, or dinner).
 */
export async function removeRecipeFromMealPlan(
  firestore: Firestore,
  userId: string,
  date: Date,
  mealType: MealType
) {
  const dateString = format(date, 'yyyy-MM-dd');
  const mealPlanDocRef = doc(firestore, `users/${userId}/mealPlans`, dateString);

  // To remove a field, we use updateDoc with deleteField().
  await updateDoc(mealPlanDocRef, {
    [mealType]: deleteField(),
  });
}

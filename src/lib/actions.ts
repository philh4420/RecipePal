'use server';

import { generateShoppingList } from "@/ai/flows/generate-shopping-list";
import { importRecipe } from "@/ai/flows/import-recipe-flow";
import type { AiRecipe, ImportRecipeOutput } from "@/ai/types";

/**
 * A server action that takes a list of recipes and uses AI to generate a shopping list.
 * @param recipes The list of recipes to generate the shopping list from.
 * @returns An object containing the shopping list or an error message.
 */
export async function generateShoppingListAction(recipes: AiRecipe[]): Promise<{ shoppingList?: string[]; error?: string }> {
  if (!recipes || recipes.length === 0) {
      return { shoppingList: [] };
  }

  try {
    const result = await generateShoppingList({ recipes });
    return result;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to generate shopping list with AI. Please try again.' };
  }
}


/**
 * A server action that extracts structured recipe data from a given URL using AI.
 * @param url The URL of the recipe to extract.
 * @returns An object containing the extracted recipe data or an error message.
 */
export async function extractRecipeFromUrl(url: string): Promise<{ recipe?: ImportRecipeOutput; error?: string }> {
    try {
        const recipe = await importRecipe({ url });
        return { recipe };
    } catch (e: any) {
        console.error('Error extracting recipe from URL:', e);
        return { error: e.message || 'Failed to extract recipe from the provided URL. Please check the URL or try another one.' };
    }
}

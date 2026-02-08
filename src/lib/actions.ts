'use server';

import { generateShoppingList } from "@/ai/flows/generate-shopping-list";
import { mealPlan, recipes as allRecipes } from "./data";
import type { Recipe as AiRecipe } from "@/ai/flows/generate-shopping-list";
import { z } from "zod";

// A simple function to get all unique recipes from the meal plan
function getRecipesFromMealPlan(): AiRecipe[] {
    const recipeIds = new Set<string>();
    
    Object.values(mealPlan).forEach(dayPlan => {
        Object.values(dayPlan).forEach(meal => {
            if (meal) {
                recipeIds.add(meal.recipe.id);
            }
        });
    });

    const recipesFromPlan = Array.from(recipeIds).map(id => {
        const recipe = allRecipes.find(r => r.id === id);
        if (!recipe) return null;
        
        // Adapt the recipe object to the AI-expected format
        return {
            name: recipe.name,
            ingredients: recipe.ingredients,
            servings: recipe.servings,
        };
    }).filter((r): r is AiRecipe => r !== null);

    return recipesFromPlan;
}


export async function getShoppingList(): Promise<{ shoppingList?: string[]; error?: string }> {
  try {
    const recipes = getRecipesFromMealPlan();

    if (recipes.length === 0) {
        return { shoppingList: [] };
    }

    const result = await generateShoppingList({ recipes });
    return result;
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate shopping list. Please try again.' };
  }
}

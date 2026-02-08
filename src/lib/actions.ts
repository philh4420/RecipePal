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

const manualRecipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  servings: z.coerce.number().min(1, "Servings must be at least 1."),
  ingredients: z.string().min(10, "Ingredients seem a bit short."),
  instructions: z.string().min(10, "Instructions seem a bit short."),
});

export async function addManualRecipe(values: z.infer<typeof manualRecipeSchema>) {
    const validatedFields = manualRecipeSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields." };
    }

    // For now, we'll just log the data to the console.
    // In the future, we will save this to the database.
    console.log("New Recipe Added:", validatedFields.data);

    // We can also split ingredients by newline
    const ingredientsArray = validatedFields.data.ingredients.split('\n').filter(line => line.trim() !== '');
    console.log("Parsed Ingredients:", ingredientsArray);

    return { success: "Recipe added successfully!" };
}

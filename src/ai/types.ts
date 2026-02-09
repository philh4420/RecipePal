import { z } from 'zod';

// Types for import-recipe-flow
export const ImportRecipeInputSchema = z.object({
  url: z.string().url().describe('The URL of the recipe to import.'),
});
export type ImportRecipeInput = z.infer<typeof ImportRecipeInputSchema>;

export const ImportRecipeOutputSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('The list of ingredients for the recipe.'),
  instructions: z.string().describe('The step-by-step instructions for preparing the recipe.'),
  servings: z.coerce.number().optional().describe('The number of servings the recipe makes.'),
  prepTime: z.coerce.number().optional().describe('The preparation time in minutes.'),
  cookTime: z.coerce.number().optional().describe('The cooking time in minutes.'),
  imageUrl: z.string().url().optional().describe('A URL for an image of the recipe, if available.'),
});
export type ImportRecipeOutput = z.infer<typeof ImportRecipeOutputSchema>;


// Types for generate-shopping-list flow
export const AiRecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('The list of ingredients for the recipe.'),
  servings: z.number().describe('The number of servings the recipe makes.'),
});
export type AiRecipe = z.infer<typeof AiRecipeSchema>;

export const GenerateShoppingListInputSchema = z.object({
  recipes: z.array(AiRecipeSchema).describe('The list of recipes to generate the shopping list from.'),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;

export const GenerateShoppingListOutputSchema = z.object({
  shoppingList: z.array(z.string()).describe('The consolidated shopping list with quantities adjusted.'),
});
export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;


// Types for generate-recipe-image flow
export const GenerateRecipeImageInputSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('The list of ingredients for the recipe.'),
});
export type GenerateRecipeImageInput = z.infer<typeof GenerateRecipeImageInputSchema>;

export const GenerateRecipeImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('The data URI of the generated image.'),
});
export type GenerateRecipeImageOutput = z.infer<typeof GenerateRecipeImageOutputSchema>;

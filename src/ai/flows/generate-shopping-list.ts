'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a consolidated shopping list from a list of recipes.
 *
 * The flow takes a list of recipes as input, extracts the ingredients from each recipe, and consolidates them into a single shopping list.
 * Duplicate ingredients are removed, and quantities are adjusted based on the number of servings specified for each recipe.
 *
 * @interface GenerateShoppingListInput - Defines the input schema for the generateShoppingList flow.
 * @interface GenerateShoppingListOutput - Defines the output schema for the generateShoppingList flow.
 * @function generateShoppingList - The main function that triggers the generateShoppingList flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateShoppingListInput, GenerateShoppingListOutput, GenerateShoppingListInputSchema, GenerateShoppingListOutputSchema } from '@/ai/types';


export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const consolidateIngredientsTool = ai.defineTool({
    name: 'consolidateIngredients',
    description: 'Consolidates a list of ingredients, removing duplicates and suggesting quantities based on recipe servings.',
    inputSchema: z.object({
      ingredients: z.array(z.string()).describe('A list of ingredients to consolidate.'),
    }),
    outputSchema: z.array(z.string()).describe('A consolidated list of ingredients with quantities adjusted.'),
  },
  async (input) => {
    // Simple implementation for demonstration purposes.
    // In a real application, this would involve more sophisticated logic
    // to merge similar ingredients and adjust quantities.
    const consolidatedIngredients: string[] = [];
    const ingredientCounts: { [key: string]: number } = {};

    input.ingredients.forEach(ingredient => {
      if (ingredientCounts[ingredient]) {
        ingredientCounts[ingredient]++;
      } else {
        ingredientCounts[ingredient] = 1;
      }
    });

    for (const ingredient in ingredientCounts) {
      consolidatedIngredients.push(`${ingredient} (x${ingredientCounts[ingredient]})`);
    }

    return consolidatedIngredients;
  }
);

const generateShoppingListPrompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  input: {schema: GenerateShoppingListInputSchema},
  output: {schema: GenerateShoppingListOutputSchema},
  tools: [consolidateIngredientsTool],
  prompt: `You are a helpful shopping list generator. You will receive a list of recipes and their ingredients.

        Your task is to generate a consolidated shopping list based on the ingredients from the recipes.

        Use the consolidateIngredients tool to remove duplicate ingredients and suggest quantities based on recipe servings.

        Recipes:{{#each recipes}}{{{this.name}}}: {{this.ingredients}} (Servings: {{this.servings}})
        {{/each}}`,
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: GenerateShoppingListInputSchema,
    outputSchema: GenerateShoppingListOutputSchema,
  },
  async input => {
    const {output} = await generateShoppingListPrompt(input);
    return output!;
  }
);

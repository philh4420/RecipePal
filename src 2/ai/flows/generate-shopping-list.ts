'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a consolidated shopping list from a list of recipes.
 *
 * The flow takes a list of recipes as input, extracts the ingredients from each recipe, and uses an AI model
 * to consolidate them into a single, categorized shopping list.
 *
 * @interface GenerateShoppingListInput - Defines the input schema for the generateShoppingList flow.
 * @interface GenerateShoppingListOutput - Defines the output schema for the generateShoppingList flow.
 * @function generateShoppingList - The main function that triggers the generateShoppingList flow.
 */

import {ai} from '@/ai/genkit';
import { GenerateShoppingListInput, GenerateShoppingListOutput, GenerateShoppingListInputSchema, GenerateShoppingListOutputSchema } from '@/ai/types';


export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const generateShoppingListPrompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  input: {schema: GenerateShoppingListInputSchema},
  output: {schema: GenerateShoppingListOutputSchema},
  prompt: `You are an intelligent shopping list assistant for the year 2026. Your task is to create a consolidated and categorized shopping list from a list of recipes.

Analyze the ingredients from all the provided recipes. Combine similar items and aggregate their quantities (e.g., "1 cup flour" + "2 cups flour" = "3 cups flour"). Be smart about combining units.

Organize the final list by common grocery store categories (e.g., Produce, Dairy & Eggs, Meat & Seafood, Pantry, Bakery, Frozen).

Present the output as a single list of strings, with category names acting as headers in the list (e.g., ["Produce", "2 apples", "1 bunch of bananas", "Dairy & Eggs", "1 dozen eggs"]).

Here are the recipes for your analysis:
{{#each recipes}}
- Recipe: {{{this.name}}} (Servings: {{this.servings}})
  Ingredients:
  {{#each this.ingredients}}
  - {{{this}}}
  {{/each}}
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
    if (!output) {
        throw new Error('The AI failed to generate a shopping list.');
    }
    return output;
  }
);

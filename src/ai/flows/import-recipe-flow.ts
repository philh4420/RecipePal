'use server';
/**
 * @fileOverview A Genkit flow for importing a recipe from a URL.
 *
 * This flow takes a URL, sends it to a generative model, and asks the model
 * to extract structured recipe information from the web page.
 */

import { ai } from '@/ai/genkit';
import {
  ImportRecipeInput,
  ImportRecipeInputSchema,
  ImportRecipeOutput,
  ImportRecipeOutputSchema,
} from '@/ai/types';

// The main function that triggers the import recipe flow.
export async function importRecipe(input: ImportRecipeInput): Promise<ImportRecipeOutput> {
  return importRecipeFlow(input);
}

const importRecipePrompt = ai.definePrompt({
  name: 'importRecipePrompt',
  input: { schema: ImportRecipeInputSchema },
  output: { schema: ImportRecipeOutputSchema },
  prompt: `You are an expert recipe data extractor. Analyze the content of the provided URL and extract the recipe details.

Please extract the following information:
- Recipe Name
- Ingredients (as a list of strings)
- Instructions (as a single block of text)
- Servings (if available)
- Prep Time in minutes (if available)
- Cook Time in minutes (if available)

URL: {{{url}}}

Extract the recipe information and provide it in the specified JSON format. If a piece of information is not available, omit it.`,
});

const importRecipeFlow = ai.defineFlow(
  {
    name: 'importRecipeFlow',
    inputSchema: ImportRecipeInputSchema,
    outputSchema: ImportRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await importRecipePrompt(input);
    if (!output) {
      throw new Error('Failed to extract recipe from URL.');
    }
    return output;
  }
);

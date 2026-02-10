'use server';
/**
 * @fileOverview A Genkit flow for generating a recipe image using AI.
 *
 * This flow takes a recipe name and ingredients and uses an image generation
 * model to create a photorealistic image of the dish.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateRecipeImageInput,
  GenerateRecipeImageInputSchema,
  GenerateRecipeImageOutput,
  GenerateRecipeImageOutputSchema,
} from '@/ai/types';

const IMAGE_MODELS_TO_TRY = [
  'googleai/imagen-4.0-fast-generate-001',
  'googleai/gemini-2.5-flash-image',
] as const;

const buildImagePrompt = (name: string, ingredients: string[]) => {
  const ingredientSummary = ingredients.slice(0, 5).join(', ');
  const ingredientLine = ingredientSummary
    ? `Key ingredients include: ${ingredientSummary}.`
    : 'Keep the dish visually accurate for the recipe name.';

  return `A high-resolution, photorealistic image of "${name}".
The dish should be presented beautifully, in the style of professional food photography.
The lighting should be bright and natural.
The image should be appetizing and focus on the food.
${ingredientLine}`;
};

// The main function that triggers the generate recipe image flow.
export async function generateRecipeImage(input: GenerateRecipeImageInput): Promise<GenerateRecipeImageOutput> {
  return generateRecipeImageFlow(input);
}

const generateRecipeImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: GenerateRecipeImageOutputSchema,
  },
  async ({ name, ingredients }) => {
    const prompt = buildImagePrompt(name, ingredients);
    const errors: string[] = [];

    for (const model of IMAGE_MODELS_TO_TRY) {
      try {
        const { media } = await ai.generate({ model, prompt });
        const imageUrl = media?.url;
        if (imageUrl) {
          return { imageUrl };
        }
        errors.push(`${model}: no image media returned`);
      } catch (error) {
        errors.push(`${model}: ${error instanceof Error ? error.message : 'unknown error'}`);
      }
    }

    throw new Error(`Failed to generate recipe image. ${errors.join(' | ')}`);
  }
);

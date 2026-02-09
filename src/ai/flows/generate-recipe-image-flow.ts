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
import { z } from 'zod';

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
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A high-resolution, photorealistic image of "${name}". 
      The dish should be presented beautifully, in the style of professional food photography. 
      The lighting should be bright and natural. 
      The image should be appetizing and focus on the food.
      Key ingredients include: ${ingredients.slice(0, 5).join(', ')}.`,
    });

    if (!media.url) {
      throw new Error('Failed to generate recipe image.');
    }

    return { imageUrl: media.url };
  }
);

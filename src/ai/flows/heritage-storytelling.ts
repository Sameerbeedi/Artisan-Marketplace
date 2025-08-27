'use server';

/**
 * @fileOverview An AI agent for crafting heritage stories for artisans.
 *
 * - generateHeritageStory - A function that generates a heritage story.
 * - HeritageStorytellingInput - The input type for the generateHeritageStory function.
 * - HeritageStorytellingOutput - The return type for the generateHeritageStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HeritageStorytellingInputSchema = z.object({
  artisanBackground: z
    .string()
    .describe('Description of the artisan\'s background.'),
  familyTraditions: z
    .string()
    .describe('Description of the artisan\'s family traditions.'),
  craftHistory: z.string().describe('Description of the artisan\'s craft history.'),
  productDescription: z.string().describe('Description of the product.'),
});
export type HeritageStorytellingInput = z.infer<typeof HeritageStorytellingInputSchema>;

const HeritageStorytellingOutputSchema = z.object({
  heritageStory: z.string().describe('A compelling heritage story for the artisan.'),
});
export type HeritageStorytellingOutput = z.infer<typeof HeritageStorytellingOutputSchema>;

export async function generateHeritageStory(
  input: HeritageStorytellingInput
): Promise<HeritageStorytellingOutput> {
  return heritageStorytellingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'heritageStorytellingPrompt',
  input: {schema: HeritageStorytellingInputSchema},
  output: {schema: HeritageStorytellingOutputSchema},
  prompt: `You are a skilled storyteller helping artisans craft compelling narratives about their heritage.

  Using the information provided, create a heritage story that connects with customers on a deeper level and showcases the value of the artisan's work. Maintain cultural nuances and traditional terminology.

  Artisan Background: {{{artisanBackground}}}
  Family Traditions: {{{familyTraditions}}}
  Craft History: {{{craftHistory}}}
  Product Description: {{{productDescription}}}

  Write a compelling heritage story:
`,
});

const heritageStorytellingFlow = ai.defineFlow(
  {
    name: 'heritageStorytellingFlow',
    inputSchema: HeritageStorytellingInputSchema,
    outputSchema: HeritageStorytellingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

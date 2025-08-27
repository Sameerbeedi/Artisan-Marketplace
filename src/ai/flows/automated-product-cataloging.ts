// This file holds the Genkit flow for automated product cataloging using image recognition.

'use server';

/**
 * @fileOverview An AI agent that automatically categorizes crafts based on image recognition.
 *
 * - catalogProduct - A function that handles the product cataloging process.
 * - CatalogProductInput - The input type for the catalogProduct function.
 * - CatalogProductOutput - The return type for the catalogProduct function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CatalogProductInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the craft, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CatalogProductInput = z.infer<typeof CatalogProductInputSchema>;

const CatalogProductOutputSchema = z.object({
  category: z.string().describe('The predicted category of the product.'),
  confidence: z
    .number()
    .describe(
      'The confidence level of the category prediction (0 to 1, 1 being the most confident).'
    ),
});
export type CatalogProductOutput = z.infer<typeof CatalogProductOutputSchema>;

export async function catalogProduct(input: CatalogProductInput): Promise<CatalogProductOutput> {
  return catalogProductFlow(input);
}

const prompt = ai.definePrompt({
  name: 'catalogProductPrompt',
  input: {schema: CatalogProductInputSchema},
  output: {schema: CatalogProductOutputSchema},
  prompt: `You are an expert in classifying handcrafted products.

  Analyze the image of the product and determine its category.

  Respond with the category and your confidence level.  The category should be a single word.

  Image: {{media url=photoDataUri}}
  `,
});

const catalogProductFlow = ai.defineFlow(
  {
    name: 'catalogProductFlow',
    inputSchema: CatalogProductInputSchema,
    outputSchema: CatalogProductOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

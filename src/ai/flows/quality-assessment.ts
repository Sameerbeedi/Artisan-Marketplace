// This file uses server-side code.
'use server';

/**
 * @fileOverview Analyzes product photos for quality indicators and suggests improvements.
 *
 * - analyzeProductPhoto - A function that handles the analysis of product photos.
 * - AnalyzeProductPhotoInput - The input type for the analyzeProductPhoto function.
 * - AnalyzeProductPhotoOutput - The return type for the analyzeProductPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProductPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productDescription: z.string().describe('The description of the product.'),
});
export type AnalyzeProductPhotoInput = z.infer<typeof AnalyzeProductPhotoInputSchema>;

const AnalyzeProductPhotoOutputSchema = z.object({
  qualityScore: z
    .number()
    .describe('A score indicating the quality of the product photo (0-100).'),
  suggestedImprovements: z
    .string()
    .describe('Suggestions for improving the product photo.'),
});
export type AnalyzeProductPhotoOutput = z.infer<typeof AnalyzeProductPhotoOutputSchema>;

export async function analyzeProductPhoto(
  input: AnalyzeProductPhotoInput
): Promise<AnalyzeProductPhotoOutput> {
  return analyzeProductPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeProductPhotoPrompt',
  input: {schema: AnalyzeProductPhotoInputSchema},
  output: {schema: AnalyzeProductPhotoOutputSchema},
  prompt: `You are an expert in product photography and visual merchandising.

You will analyze the provided product photo and description to assess its quality and provide actionable suggestions for improvement.

Consider factors such as lighting, composition, focus, clarity, and overall appeal.

Product Description: {{{productDescription}}}
Product Photo: {{media url=photoDataUri}}

Based on your analysis, provide a quality score (0-100) and specific suggestions for improving the photo to better showcase the product and attract potential buyers.
`,
});

const analyzeProductPhotoFlow = ai.defineFlow(
  {
    name: 'analyzeProductPhotoFlow',
    inputSchema: AnalyzeProductPhotoInputSchema,
    outputSchema: AnalyzeProductPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

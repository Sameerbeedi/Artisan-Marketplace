// 'use server';
/**
 * @fileOverview This file contains the Genkit flow for identifying traditional techniques used in crafts.
 *
 * - identifyTechnique - A function that handles the technique identification process.
 * - IdentifyTechniqueInput - The input type for the identifyTechnique function.
 * - IdentifyTechniqueOutput - The return type for the identifyTechnique function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyTechniqueInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the craft, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  craftDescription: z.string().describe('The description of the craft.'),
});
export type IdentifyTechniqueInput = z.infer<typeof IdentifyTechniqueInputSchema>;

const IdentifyTechniqueOutputSchema = z.object({
  techniques: z
    .array(z.string())
    .describe('An array of identified traditional techniques.'),
  confidenceLevels: z
    .array(z.number())
    .describe('An array of confidence levels for each identified technique.'),
});
export type IdentifyTechniqueOutput = z.infer<typeof IdentifyTechniqueOutputSchema>;

export async function identifyTechnique(input: IdentifyTechniqueInput): Promise<IdentifyTechniqueOutput> {
  return identifyTechniqueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyTechniquePrompt',
  input: {schema: IdentifyTechniqueInputSchema},
  output: {schema: IdentifyTechniqueOutputSchema},
  prompt: `You are an expert in traditional Indian crafts and techniques. You are able to identify the techniques used in a given craft based on its description and a photo.

  Analyze the following craft and identify the traditional techniques used, along with your confidence level (as a percentage) for each technique. Return the techniques as an array of strings, and the confidence levels as an array of numbers.

  Craft Description: {{{craftDescription}}}
  Photo: {{media url=photoDataUri}}
  `,
});

const identifyTechniqueFlow = ai.defineFlow(
  {
    name: 'identifyTechniqueFlow',
    inputSchema: IdentifyTechniqueInputSchema,
    outputSchema: IdentifyTechniqueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


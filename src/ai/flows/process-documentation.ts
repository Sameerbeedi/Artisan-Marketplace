'use server';
/**
 * @fileOverview A flow to generate step-by-step craft process descriptions with cultural context.
 *
 * - generateProcessDocumentation - A function that handles the process documentation generation.
 * - GenerateProcessDocumentationInput - The input type for the generateProcessDocumentation function.
 * - GenerateProcessDocumentationOutput - The return type for the generateProcessDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProcessDocumentationInputSchema = z.object({
  craftName: z.string().describe('The name of the craft.'),
  craftDescription: z.string().describe('A detailed description of the craft, including its cultural significance.'),
  materials: z.string().describe('A list of materials used in the craft.'),
  steps: z.string().describe('A description of the steps of the process.'),
  culturalContext: z.string().describe('The cultural context of the craft.'),
});
export type GenerateProcessDocumentationInput = z.infer<typeof GenerateProcessDocumentationInputSchema>;

const GenerateProcessDocumentationOutputSchema = z.object({
  processDescription: z.string().describe('A detailed, step-by-step description of the craft process with cultural context.'),
});
export type GenerateProcessDocumentationOutput = z.infer<typeof GenerateProcessDocumentationOutputSchema>;

export async function generateProcessDocumentation(input: GenerateProcessDocumentationInput): Promise<GenerateProcessDocumentationOutput> {
  return generateProcessDocumentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProcessDocumentationPrompt',
  input: {schema: GenerateProcessDocumentationInputSchema},
  output: {schema: GenerateProcessDocumentationOutputSchema},
  prompt: `You are an expert in traditional crafts and cultural heritage. Your task is to generate a detailed, step-by-step description of a craft process, incorporating its cultural context.

Craft Name: {{{craftName}}}
Craft Description: {{{craftDescription}}}
Materials: {{{materials}}}
Process Steps: {{{steps}}}
Cultural Context: {{{culturalContext}}}

Generate a process description that is informative, engaging, and respectful of the craft's cultural significance.`,
});

const generateProcessDocumentationFlow = ai.defineFlow(
  {
    name: 'generateProcessDocumentationFlow',
    inputSchema: GenerateProcessDocumentationInputSchema,
    outputSchema: GenerateProcessDocumentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

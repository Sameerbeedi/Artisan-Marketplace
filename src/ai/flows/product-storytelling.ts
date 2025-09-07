'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductStorytellingInputSchema = z.object({
  productTitle: z.string().describe('The title of the product.'),
  productDescription: z.string().describe('A short description of the product.'),
});
export type ProductStorytellingInput = z.infer<typeof ProductStorytellingInputSchema>;

const ProductStorytellingOutputSchema = z.object({
  creativeStory: z.string().describe('A creative and compelling story about the product.'),
  seoTags: z.array(z.string()).describe('A list of SEO-friendly tags or hashtags.'),
});
export type ProductStorytellingOutput = z.infer<typeof ProductStorytellingOutputSchema>;

export async function generateProductStory(
  input: ProductStorytellingInput
): Promise<ProductStorytellingOutput> {
  return productStorytellingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productStorytellingPrompt',
  input: {schema: ProductStorytellingInputSchema},
  output: {schema: ProductStorytellingOutputSchema},
  prompt: `You are an expert in e-commerce marketing and storytelling.

  Given the product title and description, generate a creative story that will engage customers and a list of SEO-friendly tags or hashtags to improve discoverability.

  Product Title: {{{productTitle}}}
  Product Description: {{{productDescription}}}

  Generate a creative story and SEO tags:
`,
});

const productStorytellingFlow = ai.defineFlow(
  {
    name: 'productStorytellingFlow',
    inputSchema: ProductStorytellingInputSchema,
    outputSchema: ProductStorytellingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

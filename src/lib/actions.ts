'use server';

import {
  catalogProduct,
  CatalogProductInput,
  CatalogProductOutput,
} from '@/ai/flows/automated-product-cataloging';
import {
  generateProcessDocumentation,
  GenerateProcessDocumentationInput,
  GenerateProcessDocumentationOutput,
} from '@/ai/flows/process-documentation';
import {
  generateHeritageStory,
  HeritageStorytellingInput,
  HeritageStorytellingOutput,
} from '@/ai/flows/heritage-storytelling';
import {
  analyzeProductPhoto,
  AnalyzeProductPhotoInput,
  AnalyzeProductPhotoOutput,
} from '@/ai/flows/quality-assessment';
import {
  identifyTechnique,
  IdentifyTechniqueInput,
  IdentifyTechniqueOutput,
} from '@/ai/flows/technique-identification';

type FormState<T> = {
  data: T | null;
  error: string | null;
};

export async function catalogProductAction(
  input: CatalogProductInput
): Promise<FormState<CatalogProductOutput>> {
  try {
    const result = await catalogProduct(input);
    return { data: result, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { data: null, error };
  }
}

export async function generateProcessAction(
  input: GenerateProcessDocumentationInput
): Promise<FormState<GenerateProcessDocumentationOutput>> {
  try {
    const result = await generateProcessDocumentation(input);
    return { data: result, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { data: null, error };
  }
}

export async function generateStoryAction(
  input: HeritageStorytellingInput
): Promise<FormState<HeritageStorytellingOutput>> {
  try {
    const result = await generateHeritageStory(input);
    return { data: result, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { data: null, error };
  }
}

export async function assessQualityAction(
  input: AnalyzeProductPhotoInput
): Promise<FormState<AnalyzeProductPhotoOutput>> {
  try {
    const result = await analyzeProductPhoto(input);
    return { data: result, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { data: null, error };
  }
}

export async function identifyTechniqueAction(
  input: IdentifyTechniqueInput
): Promise<FormState<IdentifyTechniqueOutput>> {
  try {
    const result = await identifyTechnique(input);
    return { data: result, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { data: null, error };
  }
}

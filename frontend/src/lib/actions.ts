'use server';

// Type definitions for our API requests and responses
interface GenerateProcessDocumentationInput {
  craftName: string;
  craftDescription: string;
  materials: string;
  steps: string;
  culturalContext: string;
}

interface GenerateProcessDocumentationOutput {
  processDescription: string;
}

interface CatalogProductInput {
  photoDataUri: string;
}

interface CatalogProductOutput {
  category: string;
  confidence: number;
}

interface AnalyzeProductPhotoInput {
  photoDataUri: string;
  productDescription: string;
}

interface AnalyzeProductPhotoOutput {
  qualityScore: number;
  suggestedImprovements: string;
}

interface IdentifyTechniqueInput {
  photoDataUri: string;
  craftDescription: string;
}

interface IdentifyTechniqueOutput {
  techniques: string[];
  confidenceLevels: number[];
}

interface HeritageStorytellingInput {
  artisanBackground: string;
  familyTraditions: string;
  craftHistory: string;
  productDescription: string;
}

interface HeritageStorytellingOutput {
  heritageStory: string;
}

interface ProductStorytellingInput {
  productTitle: string;
  productDescription: string;
}

interface ProductStorytellingOutput {
  creativeStory: string;
  seoTags: string[];
}

// Action result wrapper
interface ActionResult<T> {
  data?: T;
  error?: string;
}

// Get backend URL from environment
const getBackendUrl = () => {
  return process.env.BACKEND_URL || 'http://localhost:9079';
};

// Generic API call function
async function makeApiCall<TInput, TOutput>(
  endpoint: string,
  input: TInput
): Promise<ActionResult<TOutput>> {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    return {
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Process Documentation Action
export async function generateProcessAction(
  input: GenerateProcessDocumentationInput
): Promise<ActionResult<GenerateProcessDocumentationOutput>> {
  return makeApiCall<GenerateProcessDocumentationInput, GenerateProcessDocumentationOutput>(
    '/generate_process_documentation',
    input
  );
}

// Catalog Product Action
export async function catalogProductAction(
  input: CatalogProductInput
): Promise<ActionResult<CatalogProductOutput>> {
  return makeApiCall<CatalogProductInput, CatalogProductOutput>(
    '/catalog_product',
    input
  );
}

// Quality Assessment Action
export async function assessQualityAction(
  input: AnalyzeProductPhotoInput
): Promise<ActionResult<AnalyzeProductPhotoOutput>> {
  return makeApiCall<AnalyzeProductPhotoInput, AnalyzeProductPhotoOutput>(
    '/analyze_product_photo',
    input
  );
}

// Technique Identification Action
export async function identifyTechniqueAction(
  input: IdentifyTechniqueInput
): Promise<ActionResult<IdentifyTechniqueOutput>> {
  return makeApiCall<IdentifyTechniqueInput, IdentifyTechniqueOutput>(
    '/identify_technique',
    input
  );
}

// Heritage Storytelling Action
export async function generateHeritageStoryAction(
  input: HeritageStorytellingInput
): Promise<ActionResult<HeritageStorytellingOutput>> {
  return makeApiCall<HeritageStorytellingInput, HeritageStorytellingOutput>(
    '/generate_heritage_story',
    input
  );
}

// Product Storytelling Action
export async function generateProductStoryAction(
  input: ProductStorytellingInput
): Promise<ActionResult<ProductStorytellingOutput>> {
  return makeApiCall<ProductStorytellingInput, ProductStorytellingOutput>(
    '/generate_product_story',
    input
  );
}

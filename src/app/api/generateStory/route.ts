import { NextRequest, NextResponse } from 'next/server';
import { generateProductStory } from '@/ai/flows/product-storytelling';

export async function POST(req: NextRequest) {
  try {
    const { productTitle, productDescription } = await req.json();

    if (!productTitle || !productDescription) {
      return NextResponse.json(
        { error: 'Missing productTitle or productDescription' },
        { status: 400 }
      );
    }

    const result = await generateProductStory({ productTitle, productDescription });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating product story:', error);
    return NextResponse.json(
      { error: 'Failed to generate product story' },
      { status: 500 }
    );
  }
}

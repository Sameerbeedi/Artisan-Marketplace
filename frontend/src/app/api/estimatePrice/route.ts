import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9079';

export async function POST(request: NextRequest) {
  try {
    // Parse request body from frontend
    const body = await request.json();

    // Forward request to FastAPI backend
    const response = await fetch(`${BACKEND_URL}/estimate_price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Handle backend errors gracefully
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend Error:', errorText);

      return NextResponse.json(
        { error: 'Failed to estimate price' },
        { status: response.status }
      );
    }

    // Parse backend response
    const result = await response.json();

    // Send response back to frontend
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error (estimatePrice):', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

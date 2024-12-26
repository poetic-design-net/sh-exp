import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Revalidation endpoint for cache invalidation
export async function POST(request: NextRequest) {
  try {
    const tag = request.nextUrl.searchParams.get('tag');
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag parameter is required' },
        { status: 400 }
      );
    }

    // Revalidate the tag
    revalidateTag(tag);

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      tag
    });
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    );
  }
}

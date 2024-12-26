import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    console.log('Setting admin status for user:', userId);

    if (!userId) {
      console.error('No userId provided');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error('User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await userRef.update({
      role: 'admin',
      updatedAt: Date.now()
    });

    console.log('Successfully set admin status for user:', userId);
    return NextResponse.json({ 
      success: true,
      message: 'Admin status set successfully',
      userId 
    });
  } catch (error) {
    console.error('Error setting admin status:', error);
    return NextResponse.json({ 
      error: 'Failed to set admin status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

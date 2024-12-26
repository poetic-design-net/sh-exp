import { archiveCompletedOrders } from "app/actions/archive-orders";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log('API route: Starting archive process...');
    const result = await archiveCompletedOrders();
    console.log('API route: Archive process completed:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in archive orders API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Detailed error:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Fehler beim Archivieren der Bestellungen',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

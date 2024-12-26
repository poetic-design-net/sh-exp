import { NextResponse } from 'next/server';
import { checkAndRenewSubscriptions, processSubscriptionRenewal } from '@/app/actions/subscription-renewal';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Überprüfe den API-Key für Sicherheit (sollte in Umgebungsvariablen konfiguriert sein)
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.SUBSCRIPTION_RENEWAL_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Führe die Verlängerung der Abonnements durch
    await checkAndRenewSubscriptions();

    return NextResponse.json(
      { message: 'Subscription renewal check completed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in subscription renewal endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST-Endpunkt für manuelle Verlängerung einzelner Abonnements
export async function POST(request: Request) {
  try {
    // Überprüfe den API-Key
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.SUBSCRIPTION_RENEWAL_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse den Request-Body
    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Führe die Verlängerung durch
    const result = await processSubscriptionRenewal(subscriptionId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Subscription renewed successfully',
        subscription: result.subscription
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in manual subscription renewal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

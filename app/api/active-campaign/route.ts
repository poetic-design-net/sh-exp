import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, listId } = await request.json();

    // Validierung der Eingabedaten
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    // Validierung der Umgebungsvariablen
    const apiUrl = process.env.NEXT_PUBLIC_ACTIVECAMPAIGN_URL;
    const apiKey = process.env.NEXT_PUBLIC_ACTIVECAMPAIGN_KEY;

    if (!apiUrl || !apiKey) {
      console.error('Missing ActiveCampaign configuration:', {
        hasUrl: !!apiUrl,
        hasKey: !!apiKey
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Attempting to create contact:', { 
      email, 
      firstName, 
      lastName,
      apiUrl,
    });

    // Headers vorbereiten
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Api-Token': apiKey,
    };

    // Kontakt erstellen mit korrekten API-Feldnamen
    const contactResponse = await fetch(`${apiUrl}/api/3/contact/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contact: {
          email,
          'first_name': firstName,
          'last_name': lastName,
        },
      }),
    });

    // Response Details loggen
    console.log('Contact creation response:', {
      status: contactResponse.status,
      statusText: contactResponse.statusText,
      headers: Object.fromEntries(contactResponse.headers.entries())
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = errorText;
      }
      
      console.error('ActiveCampaign contact creation failed:', {
        status: contactResponse.status,
        statusText: contactResponse.statusText,
        error: errorData,
      });
      
      return NextResponse.json(
        { 
          error: `Failed to create contact: ${contactResponse.statusText}`,
          details: errorData
        },
        { status: contactResponse.status }
      );
    }

    const contactData = await contactResponse.json();
    console.log('Contact created successfully:', contactData);

    // Wenn eine ListId vorhanden ist, fügen wir den Kontakt zur Liste hinzu
    if (listId) {
      console.log('Attempting to add contact to list:', listId);

      const listResponse = await fetch(`${apiUrl}/api/3/contactLists`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contactList: {
            list: listId,
            contact: contactData.contact.id,
            status: 1
          },
        }),
      });

      // List Response Details loggen
      console.log('List addition response:', {
        status: listResponse.status,
        statusText: listResponse.statusText,
        headers: Object.fromEntries(listResponse.headers.entries())
      });

      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = errorText;
        }
        
        console.error('Failed to add contact to list:', {
          status: listResponse.status,
          statusText: listResponse.statusText,
          error: errorData,
        });
      } else {
        const listData = await listResponse.json();
        console.log('Contact added to list successfully:', listData);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Contact created successfully' 
    });
  } catch (error) {
    console.error('Unexpected error in ActiveCampaign API:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Detaillierte Fehlerinformationen
    const errorMessage = error instanceof Error 
      ? `${error.name}: ${error.message}` 
      : 'An unexpected error occurred';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

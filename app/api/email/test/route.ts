import { NextRequest, NextResponse } from "next/server";
import { emailService, EmailTemplate } from "@/services/email";

export async function POST(request: NextRequest) {
  try {
    const { template, email } = await request.json();

    if (!template || !email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template und Email-Adresse sind erforderlich'
        },
        { status: 400 }
      );
    }

    // Testdaten für verschiedene Templates
    const testData = {
      'order-confirmation': {
        orderNumber: 'TEST-123',
        items: [
          { name: 'Testprodukt 1', quantity: 1, price: 29.99 },
          { name: 'Testprodukt 2', quantity: 2, price: 19.99 }
        ],
        total: 69.97
      },
      'payment-receipt': {
        orderNumber: 'TEST-123',
        total: 69.97,
        paymentMethod: 'PayPal'
      },
      'membership-activation': {
        membershipName: 'Premium Mitgliedschaft',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      'status-update': {
        orderNumber: 'TEST-123',
        newStatus: 'processing'
      }
    };

    const success = await emailService.sendEmail(
      template as EmailTemplate,
      {
        to: email,
        subject: `Test: ${template}`,
        templateData: testData[template as keyof typeof testData]
      }
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test-Email wurde erfolgreich gesendet'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Fehler beim Senden der Test-Email'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Fehler im Email-Test-Endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Interner Server-Fehler',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

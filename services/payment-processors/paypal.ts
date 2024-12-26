import { PaymentProcessor, PaymentOptions, PaymentSession, PaymentVerification } from "./types";

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  mode: 'sandbox' | 'live';
}

export class PayPalProcessor implements PaymentProcessor {
  private config: PayPalConfig;

  constructor() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE;

    if (!clientId || !clientSecret) {
      console.error('Missing PayPal configuration:', {
        clientId: !!clientId,
        clientSecret: !!clientSecret,
        mode
      });
      throw new Error('PayPal Konfiguration fehlt');
    }

    this.config = {
      clientId,
      clientSecret,
      mode: (mode as 'sandbox' | 'live') || 'sandbox'
    };
  }

  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
      const response = await fetch(`https://api${this.config.mode === 'sandbox' ? '.sandbox' : ''}.paypal.com/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`PayPal OAuth error: ${error.error_description || 'Unknown error'}`);
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error('No access token received from PayPal');
      }

      return data.access_token;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw new Error('Fehler bei der PayPal Authentifizierung');
    }
  }

  async createCheckoutSession(options: PaymentOptions): Promise<PaymentSession> {
    try {
      const accessToken = await this.getAccessToken();
      const { product, successUrl, cancelUrl } = options;

      // Validate required fields
      if (!product.name || !product.price) {
        throw new Error('Produktname und Preis sind erforderlich');
      }

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: product.id,
          amount: {
            currency_code: 'EUR',
            value: product.price.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: product.price.toFixed(2)
              }
            }
          },
          items: [{
            name: product.name.substring(0, 127), // PayPal has a 127 char limit
            description: product.description ? product.description.substring(0, 127) : undefined,
            quantity: '1',
            unit_amount: {
              currency_code: 'EUR',
              value: product.price.toFixed(2)
            }
          }]
        }],
        application_context: {
          return_url: successUrl,
          cancel_url: cancelUrl,
          brand_name: 'Stefan Hiene',
          locale: 'de-DE',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING'
        }
      };

      const response = await fetch(`https://api${this.config.mode === 'sandbox' ? '.sandbox' : ''}.paypal.com/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('PayPal API error:', error);
        throw new Error(error.message || 'Fehler bei der PayPal Checkout-Erstellung');
      }

      const session = await response.json();
      const approveLink = session.links.find((link: any) => link.rel === 'approve');

      if (!approveLink) {
        throw new Error('Keine PayPal Checkout-URL gefunden');
      }

      return {
        sessionId: session.id,
        checkoutUrl: approveLink.href
      };
    } catch (error) {
      console.error('Fehler bei PayPal Checkout-Erstellung:', error);
      throw error;
    }
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerification> {
    try {
      console.log('Verifying PayPal payment for session:', sessionId);
      const accessToken = await this.getAccessToken();

      // First, check the order status
      const orderResponse = await fetch(`https://api${this.config.mode === 'sandbox' ? '.sandbox' : ''}.paypal.com/v2/checkout/orders/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const orderData = await orderResponse.json();
      console.log('PayPal order status:', orderData.status);

      if (!orderResponse.ok) {
        console.error('PayPal order check error:', orderData);
        return {
          success: false,
          productId: undefined,
          error: {
            message: 'Fehler beim Überprüfen der Bestellung',
            details: orderData.message || 'Unbekannter Fehler'
          }
        };
      }

      // Only try to capture if the order is not already completed
      if (orderData.status !== 'COMPLETED') {
        const captureResponse = await fetch(`https://api${this.config.mode === 'sandbox' ? '.sandbox' : ''}.paypal.com/v2/checkout/orders/${sessionId}/capture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const captureData = await captureResponse.json();
        console.log('PayPal capture response:', captureData);

        if (!captureResponse.ok) {
          return {
            success: false,
            productId: undefined,
            error: {
              message: 'Fehler bei der Zahlungsabwicklung',
              details: captureData.message || 'Die Zahlung konnte nicht abgeschlossen werden'
            }
          };
        }

        if (captureData.status === 'COMPLETED') {
          return {
            success: true,
            productId: captureData.purchase_units[0]?.reference_id
          };
        }
      } else {
        // Order was already completed
        return {
          success: true,
          productId: orderData.purchase_units[0]?.reference_id
        };
      }

      return {
        success: false,
        productId: undefined,
        error: {
          message: 'Zahlungsstatus ungültig',
          details: `Unerwarteter PayPal Status: ${orderData.status}`
        }
      };
    } catch (error) {
      console.error('Fehler bei PayPal Zahlungsverifizierung:', error);
      return {
        success: false,
        productId: undefined,
        error: {
          message: 'Fehler bei der Zahlungsverifizierung',
          details: error instanceof Error ? error.message : 'Unbekannter Fehler'
        }
      };
    }
  }

  async refundPayment(orderId: string): Promise<boolean> {
    try {
      console.log('Refunding PayPal payment for order:', orderId);
      const accessToken = await this.getAccessToken();

      // First, get the capture ID from the order
      const orderResponse = await fetch(`https://api${this.config.mode === 'sandbox' ? '.sandbox' : ''}.paypal.com/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        console.error('PayPal order check error:', orderData);
        throw new Error('Fehler beim Abrufen der Bestellung');
      }

      const captureId = orderData.purchase_units[0]?.payments?.captures[0]?.id;
      if (!captureId) {
        throw new Error('Keine Capture ID gefunden');
      }

      // Create refund for the capture
      const refundResponse = await fetch(`https://api${this.config.mode === 'sandbox' ? '.sandbox' : ''}.paypal.com/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note_to_payer: 'Rückerstattung Ihrer Bestellung'
        })
      });

      const refundData = await refundResponse.json();
      console.log('PayPal refund response:', refundData);

      if (!refundResponse.ok) {
        throw new Error(refundData.message || 'Fehler bei der Rückerstattung');
      }

      return refundData.status === 'COMPLETED';
    } catch (error) {
      console.error('Fehler bei PayPal Rückerstattung:', error);
      throw error;
    }
  }
}

// Singleton-Instanz exportieren
export const paypalProcessor = new PayPalProcessor();

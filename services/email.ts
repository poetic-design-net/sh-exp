import sgMail from '@sendgrid/mail';

export type EmailTemplate = 'order-confirmation' | 'payment-receipt' | 'membership-activation' | 'status-update';

interface EmailData {
  to: string;
  subject: string;
  templateData: Record<string, any>;
}

const DEV_EMAIL = 'dev@frdrk.de';
const isDevelopment = process.env.NODE_ENV === 'development';

export class EmailService {
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API Key ist nicht konfiguriert');
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  private getTemplateContent(template: EmailTemplate, data: Record<string, any>): string {
    switch (template) {
      case 'order-confirmation':
        return this.getOrderConfirmationTemplate(data);
      case 'payment-receipt':
        return this.getPaymentReceiptTemplate(data);
      case 'membership-activation':
        return this.getMembershipActivationTemplate(data);
      case 'status-update':
        return this.getStatusUpdateTemplate(data);
      default:
        throw new Error(`Unbekannte Email-Vorlage: ${template}`);
    }
  }

  private getBaseEmailStyle(): string {
    return `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #ffffff; padding: 20px; border-radius: 0 0 5px 5px; }
        .order-details { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total-section { margin-top: 20px; padding-top: 15px; border-top: 2px solid #ddd; }
        .shipping-info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 0.9em; }
        .status-badge { 
          display: inline-block;
          padding: 5px 10px;
          border-radius: 3px;
          font-size: 0.9em;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-completed { background: #d4edda; color: #155724; }
        .status-processing { background: #fff3cd; color: #856404; }
        .status-pending { background: #cce5ff; color: #004085; }
      </style>
    `;
  }

  private getOrderConfirmationTemplate(data: Record<string, any>): string {
    const { 
      orderNumber, 
      items, 
      total, 
      customerName, 
      customerEmail,
      status,
      paymentMethod,
      paymentMethodTitle,
      shippingAddress,
      createdAt
    } = data;

    const orderDate = new Date(createdAt).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${this.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Vielen Dank für Ihre Bestellung!</h1>
            </div>
            
            <div class="content">
              <p>Hallo ${customerName},</p>
              <p>vielen Dank für Ihre Bestellung. Hier finden Sie eine Übersicht Ihrer Bestellung:</p>

              <div class="order-details">
                <h2>Bestelldetails</h2>
                <p><strong>Bestellnummer:</strong> ${orderNumber}</p>
                <p><strong>Bestelldatum:</strong> ${orderDate}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${status.toLowerCase()}">${this.getStatusText(status)}</span></p>
              </div>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>Artikel</th>
                    <th>Menge</th>
                    <th>Preis</th>
                    <th>Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item: any) => `
                    <tr>
                      <td>${item.productName}</td>
                      <td>${item.quantity}x</td>
                      <td>${this.formatPrice(item.price)}</td>
                      <td>${this.formatPrice(item.total)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="total-section">
                <h3>Gesamtbetrag: ${this.formatPrice(total)}</h3>
                ${paymentMethod ? `<p><strong>Zahlungsmethode:</strong> ${paymentMethodTitle || paymentMethod}</p>` : ''}
              </div>

              ${shippingAddress ? `
                <div class="shipping-info">
                  <h3>Lieferadresse</h3>
                  <p>
                    ${shippingAddress.street}<br>
                    ${shippingAddress.postalCode} ${shippingAddress.city}<br>
                    ${shippingAddress.country}
                  </p>
                </div>
              ` : ''}

              <div class="footer">
                <p>Bei Fragen zu Ihrer Bestellung kontaktieren Sie uns gerne unter ${process.env.SUPPORT_EMAIL || 'support@stefanhiene.com'}</p>
                ${isDevelopment ? '<p><strong>ENTWICKLUNGSMODUS - Test-Email</strong></p>' : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'completed': 'Abgeschlossen',
      'processing': 'In Bearbeitung',
      'on-hold': 'Wartend',
      'pending': 'Ausstehend',
      'cancelled': 'Storniert',
      'refunded': 'Erstattet',
      'failed': 'Fehlgeschlagen'
    };
    return statusMap[status] || status;
  }

  private getPaymentReceiptTemplate(data: Record<string, any>): string {
    const { 
      orderNumber, 
      total, 
      paymentMethod,
      paymentMethodTitle,
      customerName,
      datePaid
    } = data;

    const paymentDate = datePaid ? new Date(datePaid).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${this.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Zahlungsbestätigung</h1>
            </div>
            
            <div class="content">
              <p>Hallo ${customerName},</p>
              <p>vielen Dank für Ihre Zahlung. Diese wurde erfolgreich verarbeitet.</p>

              <div class="order-details">
                <h2>Zahlungsdetails</h2>
                <p><strong>Bestellnummer:</strong> ${orderNumber}</p>
                <p><strong>Zahlungsdatum:</strong> ${paymentDate}</p>
                <p><strong>Zahlungsmethode:</strong> ${paymentMethodTitle || paymentMethod}</p>
                <p><strong>Betrag:</strong> ${this.formatPrice(total)}</p>
              </div>

              <div class="footer">
                <p>Bei Fragen zu Ihrer Zahlung kontaktieren Sie uns gerne unter ${process.env.SUPPORT_EMAIL || 'support@stefanhiene.com'}</p>
                ${isDevelopment ? '<p><strong>ENTWICKLUNGSMODUS - Test-Email</strong></p>' : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getMembershipActivationTemplate(data: Record<string, any>): string {
    const { 
      membershipName, 
      validUntil,
      customerName,
      orderNumber,
      total
    } = data;

    const validUntilDate = new Date(validUntil).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${this.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Willkommen bei Ihrer Mitgliedschaft!</h1>
            </div>
            
            <div class="content">
              <p>Hallo ${customerName},</p>
              <p>Ihre Mitgliedschaft wurde erfolgreich aktiviert. Hier sind Ihre Mitgliedschaftsdetails:</p>

              <div class="order-details">
                <h2>Mitgliedschaftsdetails</h2>
                <p><strong>Mitgliedschaft:</strong> ${membershipName}</p>
                <p><strong>Gültig bis:</strong> ${validUntilDate}</p>
                ${orderNumber ? `<p><strong>Bestellnummer:</strong> ${orderNumber}</p>` : ''}
                ${total ? `<p><strong>Betrag:</strong> ${this.formatPrice(total)}</p>` : ''}
              </div>

              <div class="content">
                <h3>Nächste Schritte</h3>
                <ul>
                  <li>Loggen Sie sich in Ihren Account ein</li>
                  <li>Entdecken Sie alle Vorteile Ihrer Mitgliedschaft</li>
                  <li>Bei Fragen steht Ihnen unser Support-Team zur Verfügung</li>
                </ul>
              </div>

              <div class="footer">
                <p>Bei Fragen zu Ihrer Mitgliedschaft kontaktieren Sie uns gerne unter ${process.env.SUPPORT_EMAIL || 'support@stefanhiene.com'}</p>
                ${isDevelopment ? '<p><strong>ENTWICKLUNGSMODUS - Test-Email</strong></p>' : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getStatusUpdateTemplate(data: Record<string, any>): string {
    const { 
      orderNumber, 
      newStatus, 
      customerName,
      items,
      total,
      shippingAddress
    } = data;

    const statusMessages = {
      processing: 'Ihre Bestellung wird bearbeitet',
      completed: 'Ihre Bestellung wurde abgeschlossen',
      cancelled: 'Ihre Bestellung wurde storniert',
      'on-hold': 'Ihre Bestellung wurde vorübergehend angehalten',
      pending: 'Ihre Bestellung wartet auf Bearbeitung',
      refunded: 'Ihre Bestellung wurde erstattet',
      failed: 'Bei Ihrer Bestellung ist ein Problem aufgetreten'
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${this.getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Status-Update zu Ihrer Bestellung</h1>
            </div>
            
            <div class="content">
              <p>Hallo ${customerName},</p>
              <p>${statusMessages[newStatus as keyof typeof statusMessages] || 'Der Status Ihrer Bestellung wurde aktualisiert'}.</p>

              <div class="order-details">
                <h2>Bestelldetails</h2>
                <p><strong>Bestellnummer:</strong> ${orderNumber}</p>
                <p><strong>Neuer Status:</strong> <span class="status-badge status-${newStatus.toLowerCase()}">${this.getStatusText(newStatus)}</span></p>
              </div>

              ${items ? `
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Artikel</th>
                      <th>Menge</th>
                      <th>Preis</th>
                      <th>Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map((item: any) => `
                      <tr>
                        <td>${item.productName}</td>
                        <td>${item.quantity}x</td>
                        <td>${this.formatPrice(item.price)}</td>
                        <td>${this.formatPrice(item.total)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>

                <div class="total-section">
                  <h3>Gesamtbetrag: ${this.formatPrice(total)}</h3>
                </div>
              ` : ''}

              ${shippingAddress ? `
                <div class="shipping-info">
                  <h3>Lieferadresse</h3>
                  <p>
                    ${shippingAddress.street}<br>
                    ${shippingAddress.postalCode} ${shippingAddress.city}<br>
                    ${shippingAddress.country}
                  </p>
                </div>
              ` : ''}

              <div class="footer">
                <p>Bei Fragen zu Ihrer Bestellung kontaktieren Sie uns gerne unter ${process.env.SUPPORT_EMAIL || 'support@stefanhiene.com'}</p>
                ${isDevelopment ? '<p><strong>ENTWICKLUNGSMODUS - Test-Email</strong></p>' : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  async sendEmail(template: EmailTemplate, emailData: EmailData): Promise<boolean> {
    try {
      // Im Entwicklungsmodus immer an dev@frdrk.de senden
      const recipientEmail = isDevelopment ? DEV_EMAIL : emailData.to;
      
      const msg = {
        to: recipientEmail,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL!,
          name: 'Stefan Hiene'
        },
        subject: isDevelopment ? `[TEST] ${emailData.subject}` : emailData.subject,
        html: this.getTemplateContent(template, emailData.templateData),
      };

      const result = await sgMail.send(msg);
      console.log('Email erfolgreich gesendet:', {
        to: recipientEmail,
        template,
        subject: msg.subject,
        isDevelopment
      });
      return true;
    } catch (error) {
      console.error('Fehler beim Senden der Email:', error);
      return false;
    }
  }
}

// Singleton-Instanz exportieren
export const emailService = new EmailService();

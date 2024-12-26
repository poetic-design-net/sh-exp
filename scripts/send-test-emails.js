const sgMail = require('@sendgrid/mail');

const DEV_EMAIL = 'dev@frdrk.de';
const isDevelopment = true;

// Email Templates
const getBaseEmailStyle = () => `
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

const formatPrice = (price) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const getStatusText = (status) => {
  const statusMap = {
    'completed': 'Abgeschlossen',
    'processing': 'In Bearbeitung',
    'on-hold': 'Wartend',
    'pending': 'Ausstehend',
    'cancelled': 'Storniert',
    'refunded': 'Erstattet',
    'failed': 'Fehlgeschlagen'
  };
  return statusMap[status] || status;
};

const testData = {
  orderConfirmation: {
    to: DEV_EMAIL,
    subject: 'Ihre Bestellung bei Stefan Hiene',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Vielen Dank für Ihre Bestellung!</h1>
            </div>
            
            <div class="content">
              <p>Hallo Max Mustermann,</p>
              <p>vielen Dank für Ihre Bestellung. Hier finden Sie eine Übersicht Ihrer Bestellung:</p>

              <div class="order-details">
                <h2>Bestelldetails</h2>
                <p><strong>Bestellnummer:</strong> TEST-1234</p>
                <p><strong>Bestelldatum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
                <p><strong>Status:</strong> <span class="status-badge status-processing">${getStatusText('processing')}</span></p>
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
                  <tr>
                    <td>Premium Coaching Paket</td>
                    <td>1x</td>
                    <td>${formatPrice(997.00)}</td>
                    <td>${formatPrice(997.00)}</td>
                  </tr>
                  <tr>
                    <td>Business Mastermind Zugang</td>
                    <td>1x</td>
                    <td>${formatPrice(497.00)}</td>
                    <td>${formatPrice(497.00)}</td>
                  </tr>
                </tbody>
              </table>

              <div class="total-section">
                <h3>Gesamtbetrag: ${formatPrice(1494.00)}</h3>
                <p><strong>Zahlungsmethode:</strong> Kreditkarte</p>
              </div>

              <div class="shipping-info">
                <h3>Lieferadresse</h3>
                <p>
                  Musterstraße 123<br>
                  10115 Berlin<br>
                  Deutschland
                </p>
              </div>

              <div class="footer">
                <p>Bei Fragen zu Ihrer Bestellung kontaktieren Sie uns gerne unter support@stefanhiene.com</p>
                ${isDevelopment ? '<p><strong>ENTWICKLUNGSMODUS - Test-Email</strong></p>' : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  },
  paymentReceipt: {
    to: DEV_EMAIL,
    subject: 'Zahlungsbestätigung für Ihre Bestellung',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Zahlungsbestätigung</h1>
            </div>
            
            <div class="content">
              <p>Hallo Max Mustermann,</p>
              <p>vielen Dank für Ihre Zahlung. Diese wurde erfolgreich verarbeitet.</p>

              <div class="order-details">
                <h2>Zahlungsdetails</h2>
                <p><strong>Bestellnummer:</strong> TEST-1234</p>
                <p><strong>Zahlungsdatum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
                <p><strong>Zahlungsmethode:</strong> Kreditkarte</p>
                <p><strong>Betrag:</strong> ${formatPrice(1494.00)}</p>
              </div>

              <div class="footer">
                <p>Bei Fragen zu Ihrer Zahlung kontaktieren Sie uns gerne unter support@stefanhiene.com</p>
                ${isDevelopment ? '<p><strong>ENTWICKLUNGSMODUS - Test-Email</strong></p>' : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  },
  membershipActivation: {
    to: DEV_EMAIL,
    subject: 'Willkommen in Ihrem Premium Membership',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Willkommen bei Ihrer Mitgliedschaft!</h1>
            </div>
            
            <div class="content">
              <p>Hallo Max Mustermann,</p>
              <p>Ihre Mitgliedschaft wurde erfolgreich aktiviert. Hier sind Ihre Mitgliedschaftsdetails:</p>

              <div class="order-details">
                <h2>Mitgliedschaftsdetails</h2>
                <p><strong>Mitgliedschaft:</strong> Business Mastermind Premium</p>
                <p><strong>Gültig bis:</strong> ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}</p>
                <p><strong>Bestellnummer:</strong> TEST-1234</p>
                <p><strong>Betrag:</strong> ${formatPrice(1997.00)}</p>
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
                <p>Bei Fragen zu Ihrer Mitgliedschaft kontaktieren Sie uns gerne unter support@stefanhiene.com</p>
                ${isDevelopment ? '<p><strong>ENTWICKLUNGSMODUS - Test-Email</strong></p>' : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  },
  statusUpdate: {
    to: DEV_EMAIL,
    subject: 'Status-Update zu Ihrer Bestellung',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${getBaseEmailStyle()}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Status-Update zu Ihrer Bestellung</h1>
            </div>
            
            <div class="content">
              <p>Hallo Max Mustermann,</p>
              <p>Der Status Ihrer Bestellung wurde aktualisiert.</p>

              <div class="order-details">
                <h2>Bestelldetails</h2>
                <p><strong>Bestellnummer:</strong> TEST-1234</p>
                <p><strong>Neuer Status:</strong> <span class="status-badge status-completed">${getStatusText('completed')}</span></p>
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
                  <tr>
                    <td>Premium Coaching Paket</td>
                    <td>1x</td>
                    <td>${formatPrice(997.00)}</td>
                    <td>${formatPrice(997.00)}</td>
                  </tr>
                  <tr>
                    <td>Business Mastermind Zugang</td>
                    <td>1x</td>
                    <td>${formatPrice(497.00)}</td>
                    <td>${formatPrice(497.00)}</td>
                  </tr>
                </tbody>
              </table>

              <div class="total-section">
                <h3>Gesamtbetrag: ${formatPrice(1494.00)}</h3>
              </div>

              <div class="shipping-info">
                <h3>Lieferadresse</h3>
                <p>
                  Musterstraße 123<br>
                  10115 Berlin<br>
                  Deutschland
                </p>
              </div>

              <div class="footer">
                <p>Bei Fragen zu Ihrer Bestellung kontaktieren Sie uns gerne unter support@stefanhiene.com</p>
                ${isDevelopment ? '<p><strong>ENTWICKLUNGSMODUS - Test-Email</strong></p>' : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }
};

async function sendTestEmails() {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY environment variable is required');
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  console.log('Sende Test-Emails...');

  try {
    // Bestellbestätigung
    await sgMail.send({
      to: testData.orderConfirmation.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@stefanhiene.com',
        name: 'Stefan Hiene'
      },
      subject: testData.orderConfirmation.subject,
      html: testData.orderConfirmation.html,
    });
    console.log('✓ Bestellbestätigung gesendet');

    // Zahlungsbestätigung
    await sgMail.send({
      to: testData.paymentReceipt.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@stefanhiene.com',
        name: 'Stefan Hiene'
      },
      subject: testData.paymentReceipt.subject,
      html: testData.paymentReceipt.html,
    });
    console.log('✓ Zahlungsbestätigung gesendet');

    // Mitgliedschaftsaktivierung
    await sgMail.send({
      to: testData.membershipActivation.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@stefanhiene.com',
        name: 'Stefan Hiene'
      },
      subject: testData.membershipActivation.subject,
      html: testData.membershipActivation.html,
    });
    console.log('✓ Mitgliedschaftsaktivierung gesendet');

    // Status-Update
    await sgMail.send({
      to: testData.statusUpdate.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@stefanhiene.com',
        name: 'Stefan Hiene'
      },
      subject: testData.statusUpdate.subject,
      html: testData.statusUpdate.html,
    });
    console.log('✓ Status-Update gesendet');
    console.log('Alle Test-Emails wurden erfolgreich gesendet!');
  } catch (error) {
    console.error('Fehler beim Senden der Test-Emails:', error);
  }
}

// Script ausführen
sendTestEmails();

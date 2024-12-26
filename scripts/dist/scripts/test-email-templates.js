import { emailService } from '../services/email.js';
async function sendTestEmails() {
    const testData = {
        orderConfirmation: {
            to: 'dev@frdrk.de',
            subject: 'Ihre Bestellung bei Stefan Hiene',
            templateData: {
                orderNumber: 'TEST-1234',
                items: [
                    {
                        productName: 'Premium Coaching Paket',
                        quantity: 1,
                        price: 997.00,
                        total: 997.00
                    },
                    {
                        productName: 'Business Mastermind Zugang',
                        quantity: 1,
                        price: 497.00,
                        total: 497.00
                    }
                ],
                total: 1494.00,
                customerName: 'Max Mustermann',
                customerEmail: 'dev@frdrk.de',
                status: 'processing',
                paymentMethod: 'stripe',
                paymentMethodTitle: 'Kreditkarte',
                createdAt: Date.now(),
                shippingAddress: {
                    street: 'Musterstraße 123',
                    city: 'Berlin',
                    postalCode: '10115',
                    country: 'Deutschland'
                }
            }
        },
        paymentReceipt: {
            to: 'dev@frdrk.de',
            subject: 'Zahlungsbestätigung für Ihre Bestellung',
            templateData: {
                orderNumber: 'TEST-1234',
                total: 1494.00,
                paymentMethod: 'stripe',
                paymentMethodTitle: 'Kreditkarte',
                customerName: 'Max Mustermann',
                datePaid: Date.now()
            }
        },
        membershipActivation: {
            to: 'dev@frdrk.de',
            subject: 'Willkommen in Ihrem Premium Membership',
            templateData: {
                membershipName: 'Business Mastermind Premium',
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 Jahr
                customerName: 'Max Mustermann',
                orderNumber: 'TEST-1234',
                total: 1997.00
            }
        },
        statusUpdate: {
            to: 'dev@frdrk.de',
            subject: 'Status-Update zu Ihrer Bestellung',
            templateData: {
                orderNumber: 'TEST-1234',
                newStatus: 'completed',
                customerName: 'Max Mustermann',
                items: [
                    {
                        productName: 'Premium Coaching Paket',
                        quantity: 1,
                        price: 997.00,
                        total: 997.00
                    },
                    {
                        productName: 'Business Mastermind Zugang',
                        quantity: 1,
                        price: 497.00,
                        total: 497.00
                    }
                ],
                total: 1494.00,
                shippingAddress: {
                    street: 'Musterstraße 123',
                    city: 'Berlin',
                    postalCode: '10115',
                    country: 'Deutschland'
                }
            }
        }
    };
    console.log('Sende Test-Emails...');
    try {
        // Bestellbestätigung
        await emailService.sendEmail('order-confirmation', testData.orderConfirmation);
        console.log('✓ Bestellbestätigung gesendet');
        // Zahlungsbestätigung
        await emailService.sendEmail('payment-receipt', testData.paymentReceipt);
        console.log('✓ Zahlungsbestätigung gesendet');
        // Mitgliedschaftsaktivierung
        await emailService.sendEmail('membership-activation', testData.membershipActivation);
        console.log('✓ Mitgliedschaftsaktivierung gesendet');
        // Status-Update
        await emailService.sendEmail('status-update', testData.statusUpdate);
        console.log('✓ Status-Update gesendet');
        console.log('Alle Test-Emails wurden erfolgreich gesendet!');
    }
    catch (error) {
        console.error('Fehler beim Senden der Test-Emails:', error);
    }
}
// Script ausführen
sendTestEmails();

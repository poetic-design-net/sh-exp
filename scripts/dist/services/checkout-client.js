function getUserId() {
    // Versuche zuerst, die User ID aus Next.js Daten zu bekommen
    const nextDataUserId = window.__NEXT_DATA__?.props?.pageProps?.user?.id;
    if (nextDataUserId) {
        console.log('User ID from Next.js data:', nextDataUserId);
        return nextDataUserId;
    }
    // Fallback: Versuche die User ID aus der URL zu bekommen
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('userId');
    console.log('User ID from URL:', urlUserId);
    return urlUserId;
}
export async function createCheckoutSession(options) {
    try {
        const baseUrl = window.location.origin;
        let endpoint;
        const userId = options.userId || getUserId();
        console.log('Creating checkout session:', {
            productId: options.productId,
            paymentMethod: options.paymentMethod,
            userId
        });
        if (!userId) {
            console.warn('No user ID found for checkout session');
        }
        let requestBody = {
            productId: options.productId,
            userId,
            paymentMethod: options.paymentMethod === 'sepa_debit' ? 'sepa_debit' : undefined
        };
        switch (options.paymentMethod) {
            case 'stripe':
            case 'sepa_debit':
                endpoint = '/api/checkout/stripe';
                break;
            case 'paypal':
                endpoint = '/api/checkout/paypal';
                break;
            case 'monero':
                endpoint = '/api/checkout/monero';
                break;
            default:
                throw new Error('Ungültige Zahlungsmethode');
        }
        console.log('Sending request to:', endpoint, 'with body:', requestBody);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        if (!response.ok) {
            const error = {
                message: data.error || 'Checkout fehlgeschlagen',
                code: data.code
            };
            console.error('Checkout error response:', error);
            throw new Error(error.message);
        }
        console.log('Checkout session response:', data);
        // Validate response data
        if (!data.sessionId && !data.paymentId) {
            throw new Error('Ungültige Antwort vom Server: Session ID fehlt');
        }
        if (!data.checkoutUrl && !data.address) {
            throw new Error('Ungültige Antwort vom Server: Checkout URL fehlt');
        }
        // Spezielle Behandlung für Monero-Zahlungen
        if (options.paymentMethod === 'monero') {
            if (!data.amount || !data.address || !data.paymentId) {
                throw new Error('Ungültige Monero-Zahlungsinformationen');
            }
            return {
                sessionId: data.paymentId,
                checkoutUrl: `/checkout/monero?amount=${data.amount}&address=${data.address}&paymentId=${data.paymentId}&productName=${encodeURIComponent(data.productName)}&eurAmount=${data.eurAmount}`
            };
        }
        // Für Stripe, SEPA und PayPal
        return {
            sessionId: data.sessionId,
            checkoutUrl: data.checkoutUrl
        };
    }
    catch (error) {
        console.error('Checkout error:', error);
        // Re-throw with a more user-friendly message if needed
        if (error instanceof Error) {
            if (error.message.includes('fetch')) {
                throw new Error('Verbindungsfehler: Bitte überprüfen Sie Ihre Internetverbindung');
            }
            throw error;
        }
        throw new Error('Ein unerwarteter Fehler ist aufgetreten');
    }
}
export async function verifyPayment(sessionId, paymentMethod, userId) {
    try {
        const endpoint = `/api/checkout/${paymentMethod === 'sepa_debit' ? 'stripe' : paymentMethod}`;
        const verificationUserId = userId || getUserId();
        console.log('Verifying payment:', {
            sessionId,
            paymentMethod,
            userId: verificationUserId
        });
        if (!verificationUserId) {
            console.error('No user ID found for payment verification');
            throw new Error('Benutzer-ID fehlt für die Zahlungsverifizierung');
        }
        const queryParams = new URLSearchParams({
            sessionId,
            userId: verificationUserId
        });
        const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || 'Zahlungsverifizierung fehlgeschlagen');
        }
        const data = await response.json();
        console.log('Payment verification response:', data);
        if (data === null) {
            throw new Error('Server returned null response');
        }
        if (typeof data.success !== 'boolean') {
            throw new Error('Ungültige Antwort vom Server: success property fehlt');
        }
        return data.success;
    }
    catch (error) {
        console.error('Payment verification error:', error);
        if (error instanceof Error) {
            if (error.message.includes('fetch')) {
                throw new Error('Verbindungsfehler: Bitte überprüfen Sie Ihre Internetverbindung');
            }
            throw error;
        }
        throw new Error('Ein unerwarteter Fehler ist aufgetreten');
    }
}

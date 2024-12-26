import crypto from 'crypto';
import moneroTs from "monero-ts";
export class MoneroProcessor {
    constructor() {
        this.moneroAddress = process.env.MONERO_WALLET_ADDRESS || '';
        this.secretViewKey = process.env.MONERO_SECRET_VIEW_KEY || '';
        if (!this.moneroAddress || !this.secretViewKey) {
            throw new Error('Missing MONERO_WALLET_ADDRESS or MONERO_SECRET_VIEW_KEY');
        }
        // Validate Monero address format (should start with 4)
        if (!this.moneroAddress.startsWith('4')) {
            throw new Error('Invalid Monero wallet address format');
        }
    }
    generatePaymentId() {
        // Generate a unique 16-character payment ID
        return crypto.randomBytes(8).toString('hex');
    }
    getMoneroAmount(eurAmount) {
        // TODO: Implement real-time XMR/EUR conversion using an API
        // For now, using a fixed rate of 1 XMR = 140 EUR
        return parseFloat((eurAmount / 140).toFixed(12));
    }
    async initializeWallet() {
        if (!this.wallet) {
            // Create a view-only wallet
            this.wallet = await moneroTs.createWalletFull({
                networkType: moneroTs.MoneroNetworkType.MAINNET,
                primaryAddress: this.moneroAddress,
                privateViewKey: this.secretViewKey,
                server: {
                    uri: "http://node.moneroworld.com:18089"
                }
            });
            // Start syncing the wallet
            await this.wallet.sync();
        }
    }
    async createCheckoutSession(options) {
        const { product } = options;
        const paymentId = this.generatePaymentId();
        const xmrAmount = this.getMoneroAmount(product.price);
        const paymentDetails = {
            address: this.moneroAddress,
            amount: xmrAmount,
            paymentId: paymentId,
        };
        // Create a URL for our custom Monero payment page
        const checkoutUrl = `/checkout/monero?` + new URLSearchParams({
            amount: xmrAmount.toString(),
            address: this.moneroAddress,
            paymentId: paymentId,
            productId: product.id,
            productName: product.name,
            eurAmount: product.price.toString(),
        }).toString();
        return {
            sessionId: paymentId,
            checkoutUrl,
        };
    }
    async verifyPayment(sessionId) {
        try {
            await this.initializeWallet();
            // Get incoming transfers
            const transfers = await this.wallet.getIncomingTransfers({
                txQuery: {
                    paymentId: sessionId,
                    isConfirmed: true,
                    minConfirmations: 1
                }
            });
            // Check if we have any confirmed transfers with this payment ID
            const hasValidPayment = transfers && transfers.length > 0;
            return {
                success: hasValidPayment,
                productId: sessionId // We should store and retrieve the actual productId
            };
        }
        catch (error) {
            console.error("Error verifying Monero payment:", error);
            return {
                success: false,
                productId: undefined
            };
        }
    }
}

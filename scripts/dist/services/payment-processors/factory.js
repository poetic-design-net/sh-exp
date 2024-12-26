import { StripeProcessor } from "./stripe-processor";
import { MoneroProcessor } from "./monero-processor";
import { paypalProcessor } from "./paypal";
export class PaymentProcessorFactory {
    static getProcessor(method) {
        let processor = this.processors.get(method);
        if (!processor) {
            switch (method) {
                case "stripe":
                    processor = new StripeProcessor();
                    break;
                case "monero":
                    processor = new MoneroProcessor();
                    break;
                case "paypal":
                    processor = paypalProcessor;
                    break;
                default:
                    throw new Error(`Unknown payment method: ${method}`);
            }
            this.processors.set(method, processor);
        }
        return processor;
    }
}
PaymentProcessorFactory.processors = new Map();

import { StripeProcessor } from "./stripe-processor";
export class StripeProcessorFactory {
    static getProcessor() {
        if (!this.processor) {
            this.processor = new StripeProcessor();
        }
        return this.processor;
    }
}

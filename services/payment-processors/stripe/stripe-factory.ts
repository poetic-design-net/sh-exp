import { PaymentProcessor } from "../types";
import { StripeProcessor } from "./stripe-processor";

export class StripeProcessorFactory {
  private static processor: StripeProcessor;

  static getProcessor(): PaymentProcessor {
    if (!this.processor) {
      this.processor = new StripeProcessor();
    }
    return this.processor;
  }
}

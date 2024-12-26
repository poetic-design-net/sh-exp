import { PaymentMethod, PaymentProcessor } from "./types";
import { StripeProcessor } from "./stripe-processor";
import { MoneroProcessor } from "./monero-processor";
import { paypalProcessor } from "./paypal";

export class PaymentProcessorFactory {
  private static processors: Map<PaymentMethod, PaymentProcessor> = new Map();

  static getProcessor(method: PaymentMethod): PaymentProcessor {
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

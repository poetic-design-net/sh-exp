import { PaymentProcessor } from "../types";
import { MoneroProcessor } from "./monero-processor";

export class MoneroProcessorFactory {
  private static processor: MoneroProcessor;

  static getProcessor(): PaymentProcessor {
    if (!this.processor) {
      this.processor = new MoneroProcessor();
    }
    return this.processor;
  }
}

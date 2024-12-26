import { MoneroProcessor } from "./monero-processor";
export class MoneroProcessorFactory {
    static getProcessor() {
        if (!this.processor) {
            this.processor = new MoneroProcessor();
        }
        return this.processor;
    }
}

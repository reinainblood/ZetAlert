import {IntegrationMessage} from "@/lib/types";

export class MessageStore {
    private static messages: IntegrationMessage[] = [];
    private static maxMessages = 100; // Limit the number of stored messages

    static addMessage(message: IntegrationMessage) {
        this.messages.unshift(message);
        if (this.messages.length > this.maxMessages) {
            this.messages.pop();
        }
    }

    static getRecentMessages(): IntegrationMessage[] {
        return [...this.messages];
    }
}
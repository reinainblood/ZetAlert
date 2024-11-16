// src/lib/messaging.ts
import axios from 'axios';

export async function sendToDiscord(message: string, webhookUrl: string) {
    return axios.post(webhookUrl, {
        content: message
    });
}

export async function sendToSlack(message: string, webhookUrl: string) {
    return axios.post(webhookUrl, {
        text: message
    });
}

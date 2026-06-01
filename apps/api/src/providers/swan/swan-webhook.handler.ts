import { Injectable, Logger } from '@nestjs/common';
import { SwanClient } from './swan.client';

export interface SwanWebhookPayload {
  eventId: string;
  eventType: string;
  resourceId: string;
  projectId: string;
  [key: string]: unknown;
}

@Injectable()
export class SwanWebhookHandler {
  private readonly logger = new Logger(SwanWebhookHandler.name);

  constructor(private readonly swan: SwanClient) {}

  verifySignature(rawBody: string, signature: string): boolean {
    return this.swan.verifyWebhookSignature(rawBody, signature);
  }

  parseEvent(rawBody: string): SwanWebhookPayload {
    return JSON.parse(rawBody) as SwanWebhookPayload;
  }
}

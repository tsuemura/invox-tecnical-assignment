import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
import { AiClient } from './ai-client';

@Injectable()
export class AiAnalysisService {
  private prisma: PrismaClient;
  private aiClient: AiClient;

  constructor() {
    this.prisma = new PrismaClient();
    const baseUrl = process.env.AI_API_BASE_URL || 'http://localhost:3001';
    this.aiClient = new AiClient(baseUrl);
  }

  async analyzeImage(imagePath: string) {
    const requestTimestamp = new Date();

    const result = await this.aiClient.analyzeImage(imagePath);
    const responseTimestamp = new Date();

    const logEntry = await this.prisma.aiAnalysisLog.create({
      data: {
        imagePath,
        success: result.success,
        message: result.message,
        class: result.estimated_data.class || null,
        confidence: result.estimated_data.confidence || null,
        requestTimestamp,
        responseTimestamp,
      },
    });

    return logEntry;
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';

@Controller('ai-analysis')
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  @Post('analyze')
  async analyzeImage(@Body() body: { imagePath: string }) {
    return this.aiAnalysisService.analyzeImage(body.imagePath);
  }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiAnalysisModule } from './ai-analysis.module';

@Module({
  imports: [AiAnalysisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

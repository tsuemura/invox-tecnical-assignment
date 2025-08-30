export interface AiAnalysisRequest {
  image_path: string;
}

export interface AiAnalysisResponse {
  success: boolean;
  message: string;
  estimated_data: {
    class?: number;
    confidence?: number;
  };
}

export class AiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async analyzeImage(imagePath: string): Promise<AiAnalysisResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_path: imagePath,
        } as AiAnalysisRequest),
      });

      if (!response.ok && (response.status < 200 || response.status >= 300)) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as AiAnalysisResponse;
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }
}

import { AiClient } from './ai-client';

// Mock fetch globally
global.fetch = jest.fn();

describe('AiClient', () => {
  let aiClient: AiClient;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    aiClient = new AiClient('http://localhost:3001');
    mockFetch.mockClear();
  });

  describe('analyzeImage', () => {
    it('should successfully analyze an image and return response', async () => {
      const mockResponse = {
        success: true,
        message: 'success',
        estimated_data: {
          class: 3,
          confidence: 0.8683,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await aiClient.analyzeImage(
        '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/test.jpg',
      );

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_path: '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/test.jpg',
        }),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle API failure response', async () => {
      const mockResponse = {
        success: false,
        message: 'Error:E50012',
        estimated_data: {},
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await aiClient.analyzeImage(
        '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/fail.jpg',
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw error for 404 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as unknown as Response);

      await expect(
        aiClient.analyzeImage(
          '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/notexist.jpg',
        ),
      ).rejects.toThrow('HTTP error! status: 404');
    });

    it('should throw error for 500 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as unknown as Response);

      await expect(
        aiClient.analyzeImage(
          '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/server-error.jpg',
        ),
      ).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle fetch error like network failure', async () => {
      mockFetch.mockRejectedValue(new TypeError('fetch failed'));

      await expect(
        aiClient.analyzeImage(
          '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/test.jpg',
        ),
      ).rejects.toThrow(TypeError);
    });
  });
});

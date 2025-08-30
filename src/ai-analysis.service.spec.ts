/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalysisService } from './ai-analysis.service';
import { PrismaClient } from '../generated/prisma';
import { spawn, ChildProcess } from 'child_process';

describe('AiAnalysisService Integration Tests', () => {
  let service: AiAnalysisService;
  let prisma: PrismaClient;
  let mockServerProcess: ChildProcess;
  const mockServerPort = 3001;

  beforeAll(async () => {
    // Start mock server using existing mock-server.ts
    mockServerProcess = spawn('pnpm', ['run', 'server:mock'], {
      stdio: 'pipe',
      detached: false,
    });

    // Wait for server to start
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Mock server failed to start'));
      }, 10000);

      mockServerProcess.stdout?.on('data', (data) => {
        if (data.toString().includes('Mock AI API server is running')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      mockServerProcess.stderr?.on('data', (data) => {
        console.error('Mock server error:', data.toString());
      });
    });

    // Set environment variable for integration test
    process.env.AI_API_BASE_URL = `http://localhost:${mockServerPort}`;
  });

  afterAll(async () => {
    // Kill mock server
    if (mockServerProcess) {
      mockServerProcess.kill();
      await new Promise<void>((resolve) => {
        mockServerProcess.on('exit', () => resolve());
      });
    }
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiAnalysisService],
    }).compile();

    service = module.get<AiAnalysisService>(AiAnalysisService);
    prisma = new PrismaClient();

    // Clean up database before each test
    await prisma.aiAnalysisLog.deleteMany();
  });

  afterEach(async () => {
    // Clean up database after each test
    await prisma.aiAnalysisLog.deleteMany();
  });

  describe('analyzeImage', () => {
    it('should successfully analyze an image and save to database', async () => {
      const imagePath =
        '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/success.jpg';

      const result = await service.analyzeImage(imagePath);

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          imagePath,
          success: true,
          message: 'success',
          class: 3,
          confidence: 0.8683,
          requestTimestamp: expect.any(Date),
          responseTimestamp: expect.any(Date),
        }),
      );

      // Verify data was saved to database
      const dbEntry = await prisma.aiAnalysisLog.findUnique({
        where: { id: result.id },
      });

      expect(dbEntry).toBeTruthy();
      expect(dbEntry?.success).toBe(true);
      expect(dbEntry?.class).toBe(3);
      expect(dbEntry?.confidence).toBe(0.8683);
    });

    it('should handle API failure and save to database', async () => {
      const imagePath =
        '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/fail.jpg';

      const result = await service.analyzeImage(imagePath);

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          imagePath,
          success: false,
          message: 'Error:E50012',
          class: null,
          confidence: null,
          requestTimestamp: expect.any(Date),
          responseTimestamp: expect.any(Date),
        }),
      );

      // Verify data was saved to database
      const dbEntry = await prisma.aiAnalysisLog.findUnique({
        where: { id: result.id },
      });

      expect(dbEntry).toBeTruthy();
      expect(dbEntry?.success).toBe(false);
      expect(dbEntry?.message).toBe('Error:E50012');
      expect(dbEntry?.class).toBeNull();
      expect(dbEntry?.confidence).toBeNull();
    });

    it('should throw error for 404 response without saving to database', async () => {
      const imagePath =
        '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/notexist.jpg';

      await expect(service.analyzeImage(imagePath)).rejects.toThrow(
        'HTTP error! status: 404',
      );

      // Verify no data was saved to database
      const dbEntries = await prisma.aiAnalysisLog.findMany();
      expect(dbEntries).toHaveLength(0);
    });

    it('should throw error for 500 response without saving to database', async () => {
      const imagePath =
        '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/server-error.jpg';

      await expect(service.analyzeImage(imagePath)).rejects.toThrow(
        'HTTP error! status: 500',
      );

      // Verify no data was saved to database
      const dbEntries = await prisma.aiAnalysisLog.findMany();
      expect(dbEntries).toHaveLength(0);
    });

    it('should handle timestamps correctly', async () => {
      const startTime = new Date();
      const imagePath =
        '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/success.jpg';

      const result = await service.analyzeImage(imagePath);
      const endTime = new Date();

      expect(result.requestTimestamp.getTime()).toBeGreaterThanOrEqual(
        startTime.getTime(),
      );
      expect(result.responseTimestamp.getTime()).toBeGreaterThanOrEqual(
        result.requestTimestamp.getTime(),
      );
      expect(result.responseTimestamp.getTime()).toBeLessThanOrEqual(
        endTime.getTime(),
      );
    });
  });
});

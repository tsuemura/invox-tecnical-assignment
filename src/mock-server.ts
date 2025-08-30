/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import * as http from 'http';

interface MockResponse {
  success: boolean;
  message: string;
  estimated_data: {
    class?: number;
    confidence?: number;
  };
}

const mockResponses: Record<string, MockResponse> = {
  '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/success.jpg': {
    success: true,
    message: 'success',
    estimated_data: {
      class: 3,
      confidence: 0.8683,
    },
  },
  '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/fail.jpg': {
    success: false,
    message: 'Error:E50012',
    estimated_data: {},
  },
  '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/test.jpg': {
    success: true,
    message: 'success',
    estimated_data: {
      class: 3,
      confidence: 0.8683,
    },
  },
};

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const parsedBody = JSON.parse(body);
        const imagePath = parsedBody.image_path;

        if (
          imagePath ===
          '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/notexist.jpg'
        ) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not Found' }));
          return;
        }

        if (
          imagePath ===
          '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/server-error.jpg'
        ) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
          return;
        }

        if (
          imagePath ===
          '/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/timeout.jpg'
        ) {
          setTimeout(() => {
            res.writeHead(408, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Request Timeout' }));
          }, 30000);
          return;
        }

        const response = mockResponses[imagePath] || {
          success: false,
          message: 'Error:E50012',
          estimated_data: {},
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Request' }));
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Mock AI API server is running on http://localhost:${PORT}`);
});

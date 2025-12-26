import request from 'supertest';
import express from 'express';
import crypto from 'crypto';
import githubWebhooks from '../routes/githubWebhooks';

const app = express();
app.use(express.json());
app.use('/api/github', githubWebhooks);

describe('GitHub Webhooks', () => {
    const secret = 'test-secret';
    process.env.GITHUB_WEBHOOK_SECRET = secret;

    const signPayload = (payload: any) => {
        const hmac = crypto.createHmac('sha256', secret);
        return 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
    };

    test('should reject requests with no signature', async () => {
        const response = await request(app)
            .post('/api/github/webhooks')
            .send({});
        expect(response.status).toBe(401);
    });

    test('should reject requests with invalid signature', async () => {
        const response = await request(app)
            .post('/api/github/webhooks')
            .set('x-hub-signature-256', 'invalid')
            .send({});
        expect(response.status).toBe(401);
    });

    test('should accept ping event with valid signature', async () => {
        const payload = { hook_id: 12345 };
        const signature = signPayload(payload);

        const response = await request(app)
            .post('/api/github/webhooks')
            .set('x-hub-signature-256', signature)
            .set('x-github-event', 'ping')
            .set('x-github-delivery', 'uuid-123')
            .send(payload);

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('Pong');
    });
});

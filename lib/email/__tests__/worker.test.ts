import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { EmailWorker } from '../worker';
import * as queue from '../queue';
import * as transporter from '../transporter';

describe('EmailWorker', () => {
  let worker: EmailWorker;

  beforeEach(() => {
    // Reset env
    process.env.EMAIL_POLL_MS = '100';
    process.env.EMAIL_MAX_ATTEMPTS = '3';
    
    worker = new EmailWorker(1);
    
    // Setup basic mocks to avoid hitting DB
    mock.method(queue, 'claimNextPendingJob', async () => null);
    mock.method(queue, 'markAsSent', async () => {});
    mock.method(queue, 'markAsFailed', async () => {});
    
    // Mock transporter
    mock.method(transporter, 'getTransporter', () => ({
      sendMail: async () => ({ messageId: 'test-123' }),
      verify: async () => true,
    }));
  });

  afterEach(async () => {
    mock.restoreAll();
    await worker.stop();
  });

  test('Worker initializes as not running', () => {
    assert.strictEqual(worker.isRunning, false);
  });

  test('Worker can be started and stopped', async () => {
    worker.start();
    assert.strictEqual(worker.isRunning, true);
    
    await worker.stop();
    assert.strictEqual(worker.isRunning, false);
  });
  
  test('Worker processes jobs when available', async () => {
    let processed = false;
    
    // Mock the claim to return a job once, then null
    let callCount = 0;
    mock.method(queue, 'claimNextPendingJob', async () => {
      if (callCount++ === 0) {
        return {
          id: 'job-123',
          to: 'test@example.com',
          subject: 'Test',
          html: '<h1>Hello</h1>',
          text: null,
          template: null,
          data: null,
          status: 'PENDING',
          attempts: 0,
          maxAttempts: 3,
        };
      }
      return null;
    });

    const markAsSentMock = mock.method(queue, 'markAsSent', async (id: string) => {
      processed = true;
      assert.strictEqual(id, 'job-123');
    });

    worker.start();
    
    // Wait for poll
    await new Promise(r => setTimeout(r, 200));
    await worker.stop();
    
    assert.strictEqual(processed, true);
    assert.strictEqual(markAsSentMock.mock.callCount(), 1);
  });
  
  test('Worker handles failures and marks as failed', async () => {
    let failed = false;
    
    mock.method(queue, 'claimNextPendingJob', async () => {
      return {
        id: 'job-error',
        to: 'error@example.com',
        subject: 'Test Error',
        html: null,
        text: 'fail me',
        template: null,
        data: null,
        status: 'PENDING',
        attempts: 0,
        maxAttempts: 3,
      };
    });

    // Mock transporter to throw an error
    mock.method(transporter, 'getTransporter', () => ({
      sendMail: async () => { throw new Error('SMTP connection failed'); }
    }));

    const markAsFailedMock = mock.method(queue, 'markAsFailed', async (id: string, error: string) => {
      failed = true;
      assert.strictEqual(id, 'job-error');
      assert.ok(error.includes('SMTP connection failed'));
    });

    worker.start();
    
    // Wait for poll
    await new Promise(r => setTimeout(r, 150));
    await worker.stop();
    
    assert.strictEqual(failed, true);
    assert.strictEqual(markAsFailedMock.mock.callCount(), 1);
  });
});

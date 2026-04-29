import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateNextRetry, shouldDeadLetter, formatDelayMs } from '../retry-strategy';

describe('Retry Strategy', () => {
  test('calculateNextRetry should calculate exponential backoff correctly without jitter', () => {
    // We can't strictly test without jitter because jitter is baked in,
    // but we can check the lower and upper bounds.
    const baseDelay = 30000;
    
    // Attempt 0: 30000 * 2^0 = 30000. Jitter: [-6000, +6000] => [24000, 36000]
    const next0 = calculateNextRetry(0, baseDelay);
    const diff0 = next0.getTime() - Date.now();
    assert.ok(diff0 >= 23900 && diff0 <= 36100, `Diff was ${diff0}`);

    // Attempt 1: 30000 * 2^1 = 60000. Jitter: [-6000, +6000] => [54000, 66000]
    const next1 = calculateNextRetry(1, baseDelay);
    const diff1 = next1.getTime() - Date.now();
    assert.ok(diff1 >= 53900 && diff1 <= 66100, `Diff was ${diff1}`);
  });

  test('shouldDeadLetter correctly identifies when max attempts are reached', () => {
    assert.strictEqual(shouldDeadLetter(4, 5), false);
    assert.strictEqual(shouldDeadLetter(5, 5), true);
    assert.strictEqual(shouldDeadLetter(6, 5), true);
  });

  test('formatDelayMs formats time nicely', () => {
    assert.strictEqual(formatDelayMs(500), '0.5s');
    assert.strictEqual(formatDelayMs(60000), '1.0m');
    assert.strictEqual(formatDelayMs(90000), '1.5m');
    assert.strictEqual(formatDelayMs(7200000), '2.0h');
  });
});

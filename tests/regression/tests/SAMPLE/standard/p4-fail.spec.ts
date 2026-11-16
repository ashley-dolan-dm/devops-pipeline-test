import { test, expect } from '@playwright/test';

test('P4 deliberate failure', async () => {
  expect(1, 'P4: this test fails on purpose').toBe(2);
});

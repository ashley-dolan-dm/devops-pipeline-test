import { test as teardown } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/*
 * Runs after each workstream's tests (it is the teardown of every test project) and deletes
 * the saved logins in tests/<WORKSTREAM>/.auth/, so no session is left on disk.
 *
 * In VS Code you can untick the teardown project to keep logins between runs while you work.
 */
teardown('delete saved logins', async () => {
  const testsDir = __dirname;
  for (const entry of fs.readdirSync(testsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const authDir = path.join(testsDir, entry.name, '.auth');
    if (!fs.existsSync(authDir)) continue;
    for (const file of fs.readdirSync(authDir)) {
      if (!file.endsWith('.json')) continue;
      try {
        fs.unlinkSync(path.join(authDir, file));
      } catch (error) {
        console.warn(`[teardown] Could not delete ${entry.name}/.auth/${file}: ${error}`);
      }
    }
  }
  console.log('[teardown] Saved logins deleted');
});

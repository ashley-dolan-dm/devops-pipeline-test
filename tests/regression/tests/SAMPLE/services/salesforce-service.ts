import { Connection } from 'jsforce';

/*
 * Salesforce API access for SAMPLE: SOQL queries, record changes, anonymous Apex and waiting
 * for async Apex. It connects as the API role (see roles.json), so it can change anything.
 * Only use it for test data: set up what a test needs, check results, and clean up.
 */
export type SalesforceRecord = { Id: string; [field: string]: unknown };

export class SalesforceService {
  private conn: Connection | undefined;

  /** Connects with an access token from the JWT login (helpers/salesforce-auth.ts). */
  async connectViaToken(accessToken: string, instanceUrl: string): Promise<void> {
    this.conn = new Connection({ accessToken, instanceUrl, version: process.env.SF_API_VERSION ?? '62.0' });
  }

  private get connection(): Connection {
    if (!this.conn) throw new Error('Not connected to Salesforce. Call connectViaToken first.');
    return this.conn;
  }

  async query<T extends Record<string, unknown> = SalesforceRecord>(soql: string): Promise<T[]> {
    const result = await this.connection.query<T>(soql);
    return result.records as T[];
  }

  async create(sobject: string, data: Record<string, unknown>): Promise<string> {
    const result = await this.connection.sobject(sobject).create(data);
    if (!('success' in result) || !result.success) throw new Error(`Could not create ${sobject}: ${JSON.stringify(result)}`);
    return result.id as string;
  }

  async update(sobject: string, id: string, data: Record<string, unknown>): Promise<void> {
    const result = await this.connection.sobject(sobject).update({ Id: id, ...data });
    if (!('success' in result) || !result.success) throw new Error(`Could not update ${sobject} ${id}: ${JSON.stringify(result)}`);
  }

  async delete(sobject: string, id: string): Promise<void> {
    const result = await this.connection.sobject(sobject).destroy(id);
    if (!('success' in result) || !result.success) throw new Error(`Could not delete ${sobject} ${id}: ${JSON.stringify(result)}`);
  }

  /** Runs anonymous Apex through the Tooling API. Fails if it does not compile or throws. */
  async executeAnonymous(apex: string): Promise<void> {
    const result = await this.connection.tooling.executeAnonymous(apex);
    if (!result.compiled) throw new Error(`Anonymous Apex did not compile: ${result.compileProblem}`);
    if (!result.success) throw new Error(`Anonymous Apex failed: ${result.exceptionMessage}\n${result.exceptionStackTrace}`);
  }

  /**
   * Waits for queued or running async Apex (queueable, batch, future) from a class to finish.
   * executeAnonymous returns as soon as the job is queued, not when it is done.
   */
  async waitForApexJobs(apexClassName: string, timeoutMs = 240_000, intervalMs = 5_000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const [row] = await this.query<{ expr0: number }>(
        `SELECT COUNT(Id) FROM AsyncApexJob WHERE ApexClass.Name = '${apexClassName}' AND Status IN ('Holding','Queued','Preparing','Processing')`,
      );
      const pending = row?.expr0 ?? 0;
      if (pending === 0) return;
      if (Date.now() > deadline) throw new Error(`Timed out waiting for ${pending} ${apexClassName} async job(s)`);
      console.log(`[apex] waiting for ${pending} ${apexClassName} job(s)`);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
}

export const salesforceService = new SalesforceService();

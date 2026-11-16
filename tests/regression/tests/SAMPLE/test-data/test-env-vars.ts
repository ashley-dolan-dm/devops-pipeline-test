import type { SalesforceService } from '../services/salesforce-service';
import { isoDatePlusDays } from '../helpers/sf-format';

/*
 * Test data for the SAMPLE workstream. These values MIRROR Regression_SAMPLE_Data.seed():
 * change one and change the other. Every seeded request has a Reference starting REG-SAMPLE-.
 */
export const SEED_PREFIX = 'REG-SAMPLE-';
export const OBJECT = 'CoE_Sample_Request__c';
export const APP = 'CoE_Sample_App';

export const REQUESTS = {
  // Seeded with no due date, so the flow sets it: High priority is due in 2 days.
  HIGH: { reference: `${SEED_PREFIX}HIGH`, priority: 'High', status: 'New', dueDate: () => isoDatePlusDays(2) },
  // Seeded with its own due date, which the flow must keep.
  LOW: { reference: `${SEED_PREFIX}LOW`, priority: 'Low', status: 'New', dueDate: () => isoDatePlusDays(30) },
  // Used by the admin suite, which closes it. No other test uses it.
  TO_CLOSE: { reference: `${SEED_PREFIX}TO-CLOSE`, priority: 'Medium', status: 'New' },
} as const;

/** References for records created through the UI in a test. The drawdown also removes these. */
export const uiReference = (): string => `${SEED_PREFIX}UI-${Date.now()}`;

export const SEED_MARKER = {
  async count(sf: SalesforceService): Promise<number> {
    const [row] = await sf.query<{ expr0: number }>(`SELECT COUNT(Id) FROM ${OBJECT} WHERE Reference__c LIKE '${SEED_PREFIX}%'`);
    return row?.expr0 ?? 0;
  },
};

/** Looks up a seeded request's Id by its reference. */
export async function requestId(sf: SalesforceService, reference: string): Promise<string> {
  const [row] = await sf.query<{ Id: string }>(`SELECT Id FROM ${OBJECT} WHERE Reference__c = '${reference}' LIMIT 1`);
  if (!row) throw new Error(`No ${OBJECT} with Reference__c ${reference}. Did the seed run?`);
  return row.Id;
}

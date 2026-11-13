/**
 * Seed and drawdown data for the SAMPLE regression tests, against the CoE sample app.
 *
 * The Playwright suite calls seed() before a run and teardown() after it, as anonymous Apex
 * through the API, logged in as the API role. The suite never deploys or edits this class: it
 * goes through the pipeline like any other change.
 *
 * Every record has a Reference starting REG-SAMPLE-, so teardown() can find them, including
 * records the tests create through the UI. Keep the values in step with
 * tests/SAMPLE/test-data/test-env-vars.ts.
 */
// Seed data is test infrastructure run by the admin role, so it runs in system mode on purpose.
@SuppressWarnings('PMD.ApexCRUDViolation')
public with sharing class Regression_SAMPLE_Data {
    public static final String PREFIX = 'REG-SAMPLE-';

    public static void seed() {
        teardown();
        insert new List<CoE_Sample_Request__c>{
            // No due date: the flow sets it from the priority (High = 2 days).
            new CoE_Sample_Request__c(Reference__c = PREFIX + 'HIGH', Priority__c = 'High'),
            // Own due date: the flow must keep it.
            new CoE_Sample_Request__c(Reference__c = PREFIX + 'LOW', Priority__c = 'Low', Due_Date__c = Date.today().addDays(30)),
            // Closed by the admin suite.
            new CoE_Sample_Request__c(Reference__c = PREFIX + 'TO-CLOSE', Priority__c = 'Medium')
        };
    }

    public static void teardown() {
        String pattern = PREFIX + '%';
        delete [SELECT Id FROM CoE_Sample_Request__c WHERE Reference__c LIKE :pattern];
    }
}

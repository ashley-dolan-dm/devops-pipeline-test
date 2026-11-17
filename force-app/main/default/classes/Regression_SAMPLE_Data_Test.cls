@IsTest
private class Regression_SAMPLE_Data_Test {
    @IsTest
    static void seedCreatesTheRequests() {
        Test.startTest();
        Regression_SAMPLE_Data.seed();
        Test.stopTest();

        Map<String, CoE_Sample_Request__c> byRef = new Map<String, CoE_Sample_Request__c>();
        for (CoE_Sample_Request__c r : [SELECT Reference__c, Status__c, Due_Date__c FROM CoE_Sample_Request__c]) {
            byRef.put(r.Reference__c, r);
        }
        Assert.areEqual(3, byRef.size(), 'Seed should create three requests');
        Assert.areEqual(Date.today().addDays(2), byRef.get('REG-SAMPLE-HIGH').Due_Date__c, 'The flow should set the High due date');
        Assert.areEqual(Date.today().addDays(30), byRef.get('REG-SAMPLE-LOW').Due_Date__c, 'The seeded due date should be kept');
    }

    @IsTest
    static void teardownRemovesSeededAndUiRecords() {
        Regression_SAMPLE_Data.seed();
        insert new CoE_Sample_Request__c(Reference__c = 'REG-SAMPLE-UI-1', Priority__c = 'Low');
        insert new CoE_Sample_Request__c(Reference__c = 'NOT-A-TEST-RECORD', Priority__c = 'Low');

        Regression_SAMPLE_Data.teardown();

        Assert.areEqual(1, [SELECT COUNT() FROM CoE_Sample_Request__c], 'Only the record without the prefix should be left');
    }

    @IsTest
    static void seedCanRunTwice() {
        Regression_SAMPLE_Data.seed();
        Regression_SAMPLE_Data.seed();
        Assert.areEqual(3, [SELECT COUNT() FROM CoE_Sample_Request__c], 'A second seed should replace, not add');
    }
}

@IsTest
private class CoESampleRequestServiceTest {
    // CoESampleRequestService reads and updates in user mode, so the tests that call it
    // first give the running user the CoE Sample App permission set. During a deployment
    // the tests run as the deploying user, who may not have access to the new fields.
    private static void grantAppAccess() {
        Id permissionSetId = [SELECT Id FROM PermissionSet WHERE Name = 'CoE_Sample_App' LIMIT 1].Id;
        Integer assigned = [
            SELECT COUNT() FROM PermissionSetAssignment
            WHERE AssigneeId = :UserInfo.getUserId() AND PermissionSetId = :permissionSetId
        ];
        if (assigned == 0) {
            insert new PermissionSetAssignment(AssigneeId = UserInfo.getUserId(), PermissionSetId = permissionSetId);
        }
    }

    @IsTest
    static void newRequestGetsDefaults() {
        CoE_Sample_Request__c request = new CoE_Sample_Request__c(Priority__c = 'High');

        Test.startTest();
        insert request;
        Test.stopTest();

        request = [SELECT Status__c, Due_Date__c FROM CoE_Sample_Request__c WHERE Id = :request.Id];
        Assert.areEqual('New', request.Status__c, 'Status should default to New');
        Assert.areEqual(Date.today().addDays(2), request.Due_Date__c, 'High priority should be due in 2 days');
    }

    @IsTest
    static void givenDueDateIsKept() {
        Date due = Date.today().addDays(30);
        CoE_Sample_Request__c request = new CoE_Sample_Request__c(Priority__c = 'Low', Due_Date__c = due);
        insert request;

        request = [SELECT Due_Date__c FROM CoE_Sample_Request__c WHERE Id = :request.Id];
        Assert.areEqual(due, request.Due_Date__c, 'A due date entered by the user should not change');
    }

    @IsTest
    static void closeRequestsSetsDone() {
        User runningUser = new User(Id = UserInfo.getUserId());
        System.runAs(runningUser) {
            grantAppAccess();
        }
        List<CoE_Sample_Request__c> requests = new List<CoE_Sample_Request__c>{
            new CoE_Sample_Request__c(Priority__c = 'Low'),
            new CoE_Sample_Request__c(Priority__c = 'Medium')
        };
        insert requests;

        Test.startTest();
        System.runAs(runningUser) {
            CoESampleRequestService.closeRequests(new List<Id>{ requests[0].Id, requests[1].Id });
        }
        Test.stopTest();

        for (CoE_Sample_Request__c request : [SELECT Status__c FROM CoE_Sample_Request__c]) {
            Assert.areEqual(CoESampleRequestService.STATUS_DONE, request.Status__c, 'Every request should be Done');
        }
    }

    @IsTest
    static void closeRequestsIgnoresEmptyList() {
        CoESampleRequestService.closeRequests(new List<Id>());
        Assert.areEqual(0, [SELECT COUNT() FROM CoE_Sample_Request__c], 'Nothing should be created or changed');
    }
}

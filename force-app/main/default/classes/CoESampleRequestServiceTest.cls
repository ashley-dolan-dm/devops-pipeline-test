/**
 * Tests for the sample app: the defaults flow and CoESampleRequestService.
 *
 * The service runs in user mode. Tests run as the user who deploys (often an integration
 * user whose profile has no access to newly deployed fields), so the tests give that user
 * the CoE Sample App permission set first. The assignment is done inside System.runAs to
 * keep it apart from the record inserts (Salesforce does not allow setup and record
 * changes in the same block).
 */
@IsTest
private class CoESampleRequestServiceTest {
    private static User currentUser() {
        return new User(Id = UserInfo.getUserId());
    }

    private static void grantAppAccess() {
        System.runAs(currentUser()) {
            PermissionSet appAccess = [SELECT Id FROM PermissionSet WHERE Name = 'CoE_Sample_App' LIMIT 1];
            Integer assigned = [
                SELECT COUNT()
                FROM PermissionSetAssignment
                WHERE AssigneeId = :UserInfo.getUserId() AND PermissionSetId = :appAccess.Id
            ];
            if (assigned == 0) {
                insert new PermissionSetAssignment(AssigneeId = UserInfo.getUserId(), PermissionSetId = appAccess.Id);
            }
        }
    }

    @IsTest
    static void newRequestGetsDefaults() {
        System.runAs(currentUser()) {
            CoE_Sample_Request__c request = new CoE_Sample_Request__c(Priority__c = 'High');

            Test.startTest();
            insert request;
            Test.stopTest();

            request = [SELECT Status__c, Due_Date__c FROM CoE_Sample_Request__c WHERE Id = :request.Id];
            Assert.areEqual('New', request.Status__c, 'Status should default to New');
            Assert.areEqual(Date.today().addDays(2), request.Due_Date__c, 'High priority should be due in 2 days');
        }
    }

    @IsTest
    static void givenDueDateIsKept() {
        System.runAs(currentUser()) {
            Date due = Date.today().addDays(30);
            CoE_Sample_Request__c request = new CoE_Sample_Request__c(Priority__c = 'Low', Due_Date__c = due);
            insert request;

            request = [SELECT Due_Date__c FROM CoE_Sample_Request__c WHERE Id = :request.Id];
            Assert.areEqual(due, request.Due_Date__c, 'A due date entered by the user should not change');
        }
    }

    @IsTest
    static void closeRequestsSetsDone() {
        grantAppAccess();
        List<CoE_Sample_Request__c> requests = new List<CoE_Sample_Request__c>{
            new CoE_Sample_Request__c(Priority__c = 'Low'),
            new CoE_Sample_Request__c(Priority__c = 'Medium')
        };
        insert requests;

        System.runAs(currentUser()) {
            Test.startTest();
            CoESampleRequestService.closeRequests(new List<Id>{ requests[0].Id, requests[1].Id });
            Test.stopTest();
        }

        for (CoE_Sample_Request__c request : [SELECT Status__c FROM CoE_Sample_Request__c]) {
            Assert.areEqual(CoESampleRequestService.STATUS_DONE, request.Status__c, 'Every request should be Done');
        }
    }

    @IsTest
    static void closeRequestsIgnoresEmptyList() {
        System.runAs(currentUser()) {
            CoESampleRequestService.closeRequests(new List<Id>());
            Assert.areEqual(0, [SELECT COUNT() FROM CoE_Sample_Request__c], 'Nothing should be created or changed');
        }
    }
}

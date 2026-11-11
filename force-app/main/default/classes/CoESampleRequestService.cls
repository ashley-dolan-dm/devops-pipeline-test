/**
 * Sample Apex for testing the CoE pipeline.
 * Closes sample requests (E2E test A1). Can be called from a flow with the "Close sample requests" action.
 */
public with sharing class CoESampleRequestService {
    public static final String STATUS_DONE = 'Done';

    @InvocableMethod(label='Close sample requests' description='Sets the status of the given sample requests to Done.')
    public static void closeRequests(List<Id> requestIds) {
        if (requestIds == null || requestIds.isEmpty()) {
            return;
        }
        List<CoE_Sample_Request__c> requests = [
            SELECT Id, Status__c
            FROM CoE_Sample_Request__c
            WHERE Id IN :requestIds
            WITH USER_MODE
        ];
        for (CoE_Sample_Request__c request : requests) {
            request.Status__c = STATUS_DONE;
        }
        update as user requests;
    }
}

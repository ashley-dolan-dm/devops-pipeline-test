/**
 * Sample Apex for testing the CoE pipeline.
 * Closes sample requests. Can be called from a flow with the "Close sample requests" action.
 */
public with sharing class CoESampleRequestService {
    /** Status a request has once it is closed. */
    public static final String STATUS_DONE = 'Done';

    /**
     * Sets the status of the given sample requests to Done.
     * Runs in user mode, so the running user needs access to the object and fields
     * (the CoE Sample App permission set gives it).
     * @param requestIds IDs of the requests to close. Null or empty does nothing.
     */
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

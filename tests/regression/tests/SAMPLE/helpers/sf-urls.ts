import { requireWsEnv } from './env';

/*
 * Salesforce addresses for SAMPLE. Take every URL from here. Never type a host into a test.
 * <WORKSTREAM>_SF_URL is the org's My Domain host, for example acme--qa.sandbox.my.salesforce.com.
 */
export function sfBase(): string {
  const host = requireWsEnv('SF_URL').replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return `https://${host}`;
}

export const appUrl = (appDeveloperName: string, namespace = 'c'): string => `${sfBase()}/lightning/app/${namespace}__${appDeveloperName}`;
export const listUrl = (objectApiName: string, view = 'Recent'): string => `${sfBase()}/lightning/o/${objectApiName}/list?filterName=${view}`;
export const newRecordUrl = (objectApiName: string): string => `${sfBase()}/lightning/o/${objectApiName}/new`;
export const recordUrl = (objectApiName: string, id: string): string => `${sfBase()}/lightning/r/${objectApiName}/${id}/view`;

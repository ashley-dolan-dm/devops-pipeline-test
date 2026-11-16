/*
 * The seed and drawdown Apex class for SAMPLE. It lives in the Salesforce source
 * (force-app/main/default/classes/Regression_SAMPLE_Data.cls) and is deployed through the
 * pipeline like any other change. The suite only calls it. Keep these names in step with it.
 */
export const APEX_COMPANION_CLASS = 'Regression_SAMPLE_Data';
export const apexSeedBody = `${APEX_COMPANION_CLASS}.seed();`;
export const apexDrawdownBody = `${APEX_COMPANION_CLASS}.teardown();`;

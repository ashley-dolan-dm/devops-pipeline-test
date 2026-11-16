import { createSign } from 'crypto';
import { readFileSync } from 'fs';
import os from 'os';
import { requireWsEnv, wsEnv, TEST_ENV, WORKSTREAM } from './env';

/*
 * JWT bearer login for SAMPLE. No passwords for internal users: the suite signs a short-lived
 * token naming the user, Salesforce checks it against the certificate in the org's external
 * client app (or connected app), and returns an access token.
 *
 * Each user must be pre-authorised for that app, or Salesforce refuses with
 * "user hasn't approved this consumer".
 *
 * The private key is found in this order, and never logged:
 *   1. SF_JWT_KEY_<ENV> or SF_JWT_KEY (CI secret, PEM text or base64 of it)
 *   2. the file named by <WORKSTREAM>_JWT_KEY_FILE in the env file (outside the repository)
 */
let cachedKey: string | undefined;

function decodeKey(value: string): string {
  return value.includes('BEGIN') ? value : Buffer.from(value, 'base64').toString('utf8');
}

function privateKey(): string {
  if (cachedKey) return cachedKey;
  const fromCi = process.env[`SF_JWT_KEY_${TEST_ENV.toUpperCase()}`] ?? process.env.SF_JWT_KEY;
  if (fromCi) {
    cachedKey = decodeKey(fromCi);
    return cachedKey;
  }
  const file = wsEnv('JWT_KEY_FILE').replace(/^~(?=$|[\\/])/, os.homedir());
  if (!file) {
    throw new Error(`No JWT key for ${WORKSTREAM} in TEST_ENV=${TEST_ENV}. Set ${WORKSTREAM}_JWT_KEY_FILE in the env file, or SF_JWT_KEY in CI.`);
  }
  try {
    cachedKey = readFileSync(file, 'utf8');
  } catch {
    throw new Error(`Cannot read the JWT key file ${file} (${WORKSTREAM}_JWT_KEY_FILE). Check the path, or ask for the key through the team password manager.`);
  }
  return cachedKey;
}

function loginUrl(): string {
  return requireWsEnv('LOGIN_URL', 'SF_LOGIN_URL').replace(/\/+$/, '');
}

function buildJwt(clientId: string, user: string, audience: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: clientId,
    sub: user,
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 300,
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(data);
  return `${data}.${signer.sign(privateKey(), 'base64url')}`;
}

/** Gets an access token for a user with the JWT bearer flow. */
export async function getAccessToken(user: string): Promise<{ accessToken: string; instanceUrl: string }> {
  if (!user) throw new Error('No username given for the JWT login. Check the role usernames in the env file.');
  const clientId = requireWsEnv('CONSUMER_KEY', 'SF_CONSUMER_KEY');
  const audience = loginUrl();
  const res = await fetch(`${audience}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: buildJwt(clientId, user, audience),
    }),
  });
  const data = (await res.json()) as { access_token?: string; instance_url?: string; error?: string; error_description?: string };
  if (!res.ok || !data.access_token || !data.instance_url) {
    throw new Error(`JWT login failed for ${user}: ${data.error_description ?? data.error ?? res.status}`);
  }
  return { accessToken: data.access_token, instanceUrl: data.instance_url };
}

/** A URL that opens Salesforce already logged in as the user. */
export async function frontdoorUrl(user: string): Promise<string> {
  const { accessToken, instanceUrl } = await getAccessToken(user);
  return `${instanceUrl}/secur/frontdoor.jsp?sid=${encodeURIComponent(accessToken)}`;
}

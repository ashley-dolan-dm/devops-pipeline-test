import fs from 'fs';
import path from 'path';
import { requireWsEnv } from './env';

/*
 * The SAMPLE test roles. roles.json is the single list: auth.setup.ts logs every role in up
 * front, and session.ts logs a role in again if its saved session is getting old.
 *
 * Each role's username is <WORKSTREAM>_<ROLE>_USERNAME in the env file. Password roles also
 * need <WORKSTREAM>_<ROLE>_PASSWORD. The role name is also the saved login file: .auth/<role>.json.
 */
export type Login = 'jwt' | 'password';
export type RoleConfig = { name: string; login: Login; api?: boolean; description?: string };

export const ROLES: RoleConfig[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../roles.json'), 'utf8'));

export function role(name: string): RoleConfig {
  const found = ROLES.find((r) => r.name === name);
  if (!found) throw new Error(`Unknown role "${name}". Roles are listed in roles.json: ${ROLES.map((r) => r.name).join(', ')}`);
  return found;
}

/** The role that runs the seed and the API calls. */
export const API_ROLE: RoleConfig = ROLES.find((r) => r.api) ?? ROLES[0];

export const username = (name: string): string => requireWsEnv(`${name.toUpperCase()}_USERNAME`);
export const password = (name: string): string => requireWsEnv(`${name.toUpperCase()}_PASSWORD`);

/** Absolute path to the saved login for a role. */
export const authFile = (name: string): string => path.join(__dirname, `../.auth/${name}.json`);

export const roleLabel = (name: string): string => name.replace(/_/g, ' ').toUpperCase();

import { exec } from './shell'
import { exec as _exec } from 'shelljs'
import { setPrivKey, ensureKnownHost } from './ssh'

export interface GitCredentials {
  name: string;
  email: string;
}

export interface GitContext {
  dir: string;
  repo: string;
  ref: string;
}

export interface SshCredentials {
  privateKey: string;
  knownHost: string;
}

export async function setCreds (gitCreds: GitCredentials, sshCreds: SshCredentials): Promise<void> {
  await exec(`git config --global user.name "${gitCreds.name}"`)
  await exec(`git config --global user.email "${gitCreds.email}"`)
  await setPrivKey(sshCreds.privateKey)
  await ensureKnownHost(sshCreds.knownHost)
}

export async function clone (context: GitContext): Promise<void> {
  await exec(`git clone "${context.repo}" "${context.dir}"`, { echo: true })
}

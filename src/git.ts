import { GitContext, GitCredentials } from './types'
import { exec } from './shell'
import { exec as _exec } from 'shelljs'
import { setPrivKey } from './ssh'

export async function setCreds (creds: GitCredentials): Promise<void> {
  await exec(`git config --global user.name "${creds.name}"`)
  await exec(`git config --global user.email "${creds.email}"`)
  await setPrivKey(creds.sshPrivateKey)
}

export async function clone (context: GitContext): Promise<void> {
  // await exec(`git clone ${context.repo} ${context.dir}`)
  await _exec(`git clone "${context.repo}" "${context.dir}"`, { async: false, silent: false })
}

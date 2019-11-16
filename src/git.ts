import { GitContext, GitCredentials } from './types'
import { exec } from './shell'
import { writeFile, mkdirp } from 'fs-extra'
import { homedir } from 'os'
import { join } from 'path'

export async function setCreds (creds: GitCredentials): Promise<void> {
  const sshDir = join(homedir(), '.ssh')
  const idRsaPath = join(sshDir, 'id_rsa')
  await exec(`git config --global user.name "${creds.name}"`)
  await exec(`git config --global user.email "${creds.email}"`)
  await mkdirp(sshDir)
  await writeFile(idRsaPath, creds.sshPrivateKey)
}

export async function clone (context: GitContext): Promise<void> {
  await exec(`git clone ${context.repo} ${context.dir}`)
}

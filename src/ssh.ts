import { read } from './fs'
import { ensureDir, ensureFile, writeFile } from 'fs-extra'
import e from 'expand-tilde'

const OWNER_ONLY_ACCESS = 0o600
const SSH_DIR = e('~/.ssh')
export const PRIVATE_KEY_FILE = e('~/.ssh/id_rsa')
export const KNOWN_HOSTS_FILE = e('~/.ssh/known_hosts')

export async function setPrivKey (privKey: string): Promise<void> {
  await ensureDir(SSH_DIR)
  await writeFile(PRIVATE_KEY_FILE, privKey, { mode: OWNER_ONLY_ACCESS })
}

export async function ensureKnownHost (pubKeyLine: string): Promise<void> {
  await ensureFile(KNOWN_HOSTS_FILE)
  const lines = (await read(KNOWN_HOSTS_FILE)).split('\n')
  if (lines.includes(pubKeyLine)) return

  lines.push(pubKeyLine)
  await writeFile(KNOWN_HOSTS_FILE, lines.join('\n'))
}

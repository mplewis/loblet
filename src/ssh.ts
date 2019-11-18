import { read } from './fs'
import { ensureFile, writeFile } from 'fs-extra'
import e from 'expand-tilde'

export const PRIVATE_KEY_FILE = e('~/.ssh/id_rsa')
export const KNOWN_HOSTS_FILE = e('~/.ssh/known_hosts')

export async function setPrivKey (privKey: string): Promise<void> {
  await ensureFile(PRIVATE_KEY_FILE)
  await writeFile(PRIVATE_KEY_FILE, privKey, { mode: 0o644 })
}

export async function ensureKnownHost (pubKeyLine: string): Promise<void> {
  await ensureFile(KNOWN_HOSTS_FILE)
  const lines = (await read(KNOWN_HOSTS_FILE)).split('\n')
  if (lines.includes(pubKeyLine)) return

  lines.push(pubKeyLine)
  await writeFile(KNOWN_HOSTS_FILE, lines.join('\n'))
}

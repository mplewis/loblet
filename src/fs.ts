import e from 'expand-tilde'
import { readFile } from 'fs-extra'

export async function read (path: string): Promise<string> {
  return (await readFile(e(path))).toString()
}

import * as tmp from 'tmp-promise'
import { remove } from 'fs-extra'

export default async function tempdir (fn: (dir: string) => Promise<void>): Promise<void> {
  const { path } = await tmp.dir()
  try {
    await fn(path)
  } finally {
    await remove(path)
  }
}

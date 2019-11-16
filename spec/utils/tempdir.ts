import * as tmp from 'tmp-promise'

export default async function tempdir (fn: (dir: string) => Promise<void>): Promise<void> {
  const { path, cleanup } = await tmp.dir()
  try {
    await fn(path)
  } finally {
    await cleanup()
  }
}

import { setCreds, clone } from './git'
import { PRIVATE_KEY_FILE } from './ssh'
import { exec } from './shell'
import ensureContainerized from '../spec/utils/ensure_containerized'
import tempdir from '../spec/utils/tempdir'
import { privKey } from '../spec/fixtures/ssh'
import { join } from 'path'
import { read } from './fs'
import { unlink } from 'fs-extra'

ensureContainerized()

async function ask (cmd: string, trim = true): Promise<string> {
  const result = (await exec(cmd)).stdout
  if (!trim) return result
  return result.trim()
}

describe.skip('cleaning up after private key', () => {
  afterEach(async () => { await unlink(PRIVATE_KEY_FILE) })

  describe('setCreds', () => {
    it('works as expected', async () => {
      await setCreds({
        name: 'Helvetica Black',
        email: 'hel@mplewis.com',
        sshPrivateKey: 'some-private-key'
      })
      expect(await ask('git config --get user.name')).toEqual('Helvetica Black')
      expect(await ask('git config --get user.email')).toEqual('hel@mplewis.com')
      expect(await read('~/.ssh/id_rsa')).toEqual('some-private-key')
    })
  })

  describe('clone', () => {
    // beforeAll(() => {
    //   jest.setTimeout(15 * 1000)
    // })
    // afterAll(() => {
    //   jest.setTimeout(5 * 1000)
    // })

    it('works as expected', async () => {
      await setCreds({
        name: 'Helvetica Black',
        email: 'hel@mplewis.com',
        sshPrivateKey: privKey
      })
      await tempdir(async dir => {
        await clone({
          dir,
          repo: 'git@github.com:mplewis/private-clonable-repo.git',
          ref: 'master'
        })
        const path = join(dir, 'README.md')
        const contents = await ask(`cat "${path}"`)
        expect(contents).toEqual('If you can read this, the clone was successful!')
      })
    })
  })
})

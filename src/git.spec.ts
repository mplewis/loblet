import { setCreds, clone } from './git'
import { exec } from './shell'
import ensureContainerized from '../spec/utils/ensure_containerized'
import tempdir from '../spec/utils/tempdir'
import { privKey, githubKnownHost } from '../spec/fixtures/ssh'
import { join } from 'path'
import { read } from './fs'
import { PRIVATE_KEY_FILE } from './ssh'
import { unlink, remove } from 'fs-extra'
import expandTilde = require('expand-tilde')

ensureContainerized()

async function ask (cmd: string, trim = true): Promise<string> {
  const result = (await exec(cmd)).stdout
  if (!trim) return result
  return result.trim()
}

const gitCreds = {
  name: 'Helvetica Black',
  email: 'hel@mplewis.com'
}

describe('cleaning up after private key', () => {
  afterEach(async () => { await remove(expandTilde('~/.ssh')) })

  describe('setCreds', () => {
    it('works as expected', async () => {
      const sshCreds = {
        privateKey: 'some-private-key',
        knownHost: githubKnownHost
      }
      await setCreds(gitCreds, sshCreds)
      expect(await ask('git config --get user.name')).toEqual('Helvetica Black')
      expect(await ask('git config --get user.email')).toEqual('hel@mplewis.com')
      expect(await read('~/.ssh/id_rsa')).toEqual('some-private-key')
    })
  })

  describe('clone', () => {
    describe('after setting creds', () => {
      beforeEach(async () => {
        const sshCreds = {
          privateKey: privKey,
          knownHost: githubKnownHost
        }
        await setCreds(gitCreds, sshCreds)
      })

      it('works as expected', async () => {
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
})

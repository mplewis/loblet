import { ensureKnownHost, KNOWN_HOSTS_FILE } from './ssh'
import ensureContainerized from '../spec/utils/ensure_containerized'
import { privKey } from '../spec/fixtures/ssh'
import { unlink, ensureFile, writeFile } from 'fs-extra'
import { read } from './fs'
import { exec } from './shell'
import expandTilde = require('expand-tilde')

ensureContainerized()

const ID_RSA = expandTilde('~/.ssh/id_rsa')
const GITHUB_KNOWN_HOST = 'github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ=='

async function itPopulatesTheFileAsExpected (times = 1): Promise<void> {
  it('populates the file as expected', async () => {
    for (let i = 0; i < times; i++) {
      await ensureKnownHost(GITHUB_KNOWN_HOST)
    }
    expect(await read(KNOWN_HOSTS_FILE)).toMatchSnapshot()
  })
}

describe('ensureKnownHost', () => {
  afterEach(async () => { await unlink(KNOWN_HOSTS_FILE) })

  describe('when no file exists', () => {
    itPopulatesTheFileAsExpected()
  })

  describe('when an empty file exists', () => {
    beforeEach(async () => { await ensureFile(KNOWN_HOSTS_FILE) })
    itPopulatesTheFileAsExpected()
  })

  describe('when the file exists with no matching line', () => {
    beforeEach(async () => {
      const lines = [
        'mplewis.com ssh-rsa SOME-FAKE-KEY-DATA',
        'fdnt.me ssh-rsa SOME-FAKE-KEY-DATA'
      ]
      await writeFile(KNOWN_HOSTS_FILE, lines.join('\n'))
    })
    itPopulatesTheFileAsExpected()
  })

  describe('ensuring the line exists multiple times in a row', () => {
    beforeEach(async () => {
      const lines = [
        'mplewis.com ssh-rsa SOME-FAKE-KEY-DATA',
        'fdnt.me ssh-rsa SOME-FAKE-KEY-DATA'
      ]
      await writeFile(KNOWN_HOSTS_FILE, lines.join('\n'))
    })
    itPopulatesTheFileAsExpected(5)
  })

  describe('when the file exists with a matching line', () => {
    beforeEach(async () => {
      const lines = [
        'mplewis.com ssh-rsa SOME-FAKE-KEY-DATA',
        'fdnt.me ssh-rsa SOME-FAKE-KEY-DATA',
        GITHUB_KNOWN_HOST
      ]
      await writeFile(KNOWN_HOSTS_FILE, lines.join('\n'))
    })
    itPopulatesTheFileAsExpected()
  })

  describe('after ensuring the GitHub known host', () => {
    beforeEach(async () => {
      await ensureKnownHost(GITHUB_KNOWN_HOST)
      await writeFile(ID_RSA, privKey, { mode: 0o600 })
    })
    afterEach(async () => { await unlink(ID_RSA) })
    it('connects to GitHub successfully', async () => {
      const { stderr } = await exec('ssh -T git@github.com', { exitCode: 1 })
      expect(stderr).toContain("Hi mplewis/private-clonable-repo! You've successfully authenticated, but GitHub does not provide shell access.")
    })
  })
})

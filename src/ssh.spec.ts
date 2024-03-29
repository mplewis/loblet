import { ensureKnownHost, KNOWN_HOSTS_FILE } from './ssh'
import ensureContainerized from '../spec/utils/ensure_containerized'
import { privKey, githubKnownHost } from '../spec/fixtures/ssh'
import { unlink, ensureFile, writeFile, remove } from 'fs-extra'
import { read } from './fs'
import { exec } from './shell'
import expandTilde = require('expand-tilde')

ensureContainerized()

const ID_RSA = expandTilde('~/.ssh/id_rsa')

async function writeKnownHosts (hosts: string[]): Promise<void> {
  await ensureFile(KNOWN_HOSTS_FILE)
  await writeFile(KNOWN_HOSTS_FILE, hosts.join('\n'))
}

async function itPopulatesTheFileAsExpected (times = 1): Promise<void> {
  it('populates the file as expected', async () => {
    for (let i = 0; i < times; i++) {
      await ensureKnownHost(githubKnownHost)
    }
    expect(await read(KNOWN_HOSTS_FILE)).toMatchSnapshot()
  })
}

describe('ensureKnownHost', () => {
  afterEach(async () => { await remove(expandTilde('~/.ssh')) })

  describe('when no file exists', () => {
    itPopulatesTheFileAsExpected()
  })

  describe('when an empty file exists', () => {
    beforeEach(async () => { await ensureFile(KNOWN_HOSTS_FILE) })
    itPopulatesTheFileAsExpected()
  })

  describe('when the file exists with no matching line', () => {
    beforeEach(async () => {
      await writeKnownHosts([
        'mplewis.com ssh-rsa SOME-FAKE-KEY-DATA',
        'fdnt.me ssh-rsa SOME-FAKE-KEY-DATA'
      ])
    })
    itPopulatesTheFileAsExpected()
  })

  describe('ensuring the line exists multiple times in a row', () => {
    beforeEach(async () => {
      await writeKnownHosts([
        'mplewis.com ssh-rsa SOME-FAKE-KEY-DATA',
        'fdnt.me ssh-rsa SOME-FAKE-KEY-DATA'
      ])
    })
    itPopulatesTheFileAsExpected(5)
  })

  describe('when the file exists with a matching line', () => {
    beforeEach(async () => {
      await writeKnownHosts([
        'mplewis.com ssh-rsa SOME-FAKE-KEY-DATA',
        'fdnt.me ssh-rsa SOME-FAKE-KEY-DATA',
        githubKnownHost
      ])
    })
    itPopulatesTheFileAsExpected()
  })

  describe('after ensuring the GitHub known host', () => {
    beforeEach(async () => {
      await ensureKnownHost(githubKnownHost)
      await writeFile(ID_RSA, privKey, { mode: 0o600 })
    })
    afterEach(async () => { await unlink(ID_RSA) })
    it('connects to GitHub successfully', async () => {
      const { stderr } = await exec('ssh -T git@github.com', { exitCode: 1 })
      expect(stderr).toContain("Hi mplewis/private-clonable-repo! You've successfully authenticated, but GitHub does not provide shell access.")
    })
  })
})

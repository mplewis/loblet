import { setCreds } from './git'
import ensureContainerized from '../spec/utils/ensure_containerized'
import { exec } from './shell'

ensureContainerized()

async function ask (cmd: string, trim = true): Promise<string> {
  const result = (await exec(cmd)).stdout
  if (!trim) return result
  return result.trim()
}

describe('setCreds', () => {
  it('works as expected', async () => {
    await setCreds({
      name: 'Helvetica Black',
      email: 'hel@mplewis.com',
      sshPrivateKey: 'some-private-key'
    })
    expect(await ask('git config --get user.name')).toEqual('Helvetica Black')
    expect(await ask('git config --get user.email')).toEqual('hel@mplewis.com')
    expect(await ask('cat ~/.ssh/id_rsa')).toEqual('some-private-key')
  })
})

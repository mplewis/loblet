import { exec as _exec } from 'shelljs'
import { red, blue } from 'chalk'

const COLORS = {
  ECHO: blue,
  ERROR: red
}

export async function exec (cmd: string): Promise<{ stdout: string; stderr: string }> {
  console.log(COLORS.ECHO(cmd))
  const process = await _exec(cmd, { async: true, silent: false })
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    process.stdout.on('data', s => { stdout += s })
    process.stderr.on('data', s => { stderr += s })
    process.on('close', (code) => {
      if (code === 0) return resolve({ stdout, stderr })

      const msg = `Process exited with code ${code}: ${cmd}`
      console.log(COLORS.ERROR(msg))
      if (stdout.length > 0) {
        console.log(COLORS.ERROR('stdout:'))
        console.log(stdout)
      }
      if (stderr.length > 0) {
        console.log(COLORS.ERROR('stderr:'))
        console.log(stderr)
      }
      return reject(new Error(msg))
    })
  })
}

import { exec as _exec } from 'shelljs'
import { red, blue } from 'chalk'

interface Options {
  echo?: boolean;
  exitCode?: number;
}

const DEFAULTS: Options = {
  echo: false,
  exitCode: 0
}

const COLORS = {
  ECHO: blue,
  ERROR: red
}

export async function exec (cmd: string, options?: Options): Promise<{ stdout: string; stderr: string }> {
  const resolvedOptions: Options = Object.assign({}, DEFAULTS, options)
  const silent = !resolvedOptions.echo
  const expectedExitCode = resolvedOptions.exitCode

  const log = (msg: string): void => { if (!silent) console.log(msg) }

  log(COLORS.ECHO(cmd))
  const process = await _exec(cmd, { async: true, silent })
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    process.stdout.on('data', s => { stdout += s })
    process.stderr.on('data', s => { stderr += s })
    process.on('close', (code) => {
      if (code === expectedExitCode) return resolve({ stdout, stderr })

      const msg = `Process exited with code ${code}: ${cmd}`
      log(COLORS.ERROR(msg))
      if (stdout.length > 0) {
        log(COLORS.ERROR('stdout:'))
        log(stdout)
      }
      if (stderr.length > 0) {
        log(COLORS.ERROR('stderr:'))
        log(stderr)
      }
      return reject(new Error(msg))
    })
  })
}

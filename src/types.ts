export interface GitCredentials {
  name: string;
  email: string;
  sshPrivateKey: string;
}

export interface GitContext {
  dir: string;
  repo: string;
  ref: string;
}

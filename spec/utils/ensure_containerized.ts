export default function ensureContainerized (): void {
  if (!process.env.CONTAINERIZED) {
    throw new Error('This test must be run from inside the Docker container')
  }
}

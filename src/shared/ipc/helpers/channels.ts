export function serviceInvokeChannel(service: string) {
  return `service:${service}:invoke`
}

export function servicePublishChannel(service: string) {
  return `service:${service}:notify`
}

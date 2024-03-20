export class NotImplementedException extends Error {
  constructor() {
    super('Not implemented')
  }
}

export function todo() {
  throw new NotImplementedException()
}

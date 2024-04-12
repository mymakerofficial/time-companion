export class NotImplementedException extends Error {
  constructor() {
    super('Not implemented')
  }
}

export function todo(): never {
  throw new NotImplementedException()
}

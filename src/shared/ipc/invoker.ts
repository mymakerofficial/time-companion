import { propertiesOf } from '@shared/lib/utils/object'
import { check } from '@shared/lib/utils/checks'
import { setOf } from '@shared/lib/utils/list'

export interface Invoker {
  // invoke a method on the receiver object
  invoke(method: string, ...args: any[]): Promise<any>
}

class InvokerImpl implements Invoker {
  private methods: Set<string>

  constructor(private readonly receiver: object) {
    this.methods = setOf(
      propertiesOf(this.receiver).filter((prop) => prop !== 'constructor'),
    )
  }

  async invoke(method: string, ...args: any[]) {
    check(this.methods.has(method), `Method ${method} not found`)
    // @ts-expect-error we already checked that the method exists
    return await this.receiver[method](...args)
  }
}

// creates an invoker object that forwards method calls to the receiver object
export function createInvoker(service: object): Invoker {
  return new InvokerImpl(service)
}

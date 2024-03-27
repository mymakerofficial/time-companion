import { propertiesOf } from '@shared/lib/utils/object'
import { check } from '@shared/lib/utils/checks'
import { setOf } from '@shared/lib/utils/list'

export interface Invoker {
  invoke(method: string, ...args: any[]): Promise<any>
}

class InvokerImpl implements Invoker {
  private methods: Set<string>

  constructor(private readonly receiver: object) {
    this.methods = setOf(propertiesOf(this.receiver))
  }

  async invoke(method: string, ...args: any[]) {
    check(this.methods.has(method), `Method ${method} not found`)
    // @ts-expect-error
    return await this.receiver[method](...args)
  }
}

export function createInvoker(service: object): Invoker {
  return new InvokerImpl(service)
}

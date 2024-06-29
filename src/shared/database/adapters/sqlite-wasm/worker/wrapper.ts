import SqliteWorker from './worker?worker'
import { Mutex } from 'async-mutex'

export class SqliteWorkerWrapper {
  private worker: Worker
  private initMutex: Mutex
  private execMutex: Mutex

  constructor() {
    this.initMutex = new Mutex()
    this.execMutex = new Mutex()
    this.worker = new SqliteWorker()
    this.worker.onmessage = (e) => this.handleMessage(e)
  }

  async init() {
    await this.initMutex.acquire()
    this.worker.postMessage({ type: 'init' })
    await this.initMutex.waitForUnlock()
  }

  async exec(sql: string): Promise<void> {
    await this.execMutex.acquire()
    this.worker.postMessage({ type: 'exec', payload: sql })
    await this.execMutex.waitForUnlock()
  }

  handleMessage(event: MessageEvent) {
    const { type, payload } = event.data
    switch (type) {
      case 'log':
        console.log(payload)
        break
      case 'error':
        console.log(payload)
        break
      case 'init':
        console.log('Wrapper received init')
        this.initMutex.release()
        break
      case 'exec':
        console.log('Wrapper received exec', payload)
        this.execMutex.release()
        break
    }
  }
}

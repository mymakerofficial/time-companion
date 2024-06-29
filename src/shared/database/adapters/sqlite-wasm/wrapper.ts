import '@sqlite.org/sqlite-wasm'

const sqlite3WorkerPromiser = () => {
  return new Promise((resolve) => {
    const _promiser = globalThis.sqlite3Worker1Promiser({
      onready: () => {
        resolve(_promiser)
      },
    })
  })
}

export { sqlite3WorkerPromiser }

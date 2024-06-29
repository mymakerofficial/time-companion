import sqlite3InitModule, {
  type Database,
  type Sqlite3Static,
} from '@sqlite.org/sqlite-wasm'

const log = (...args: unknown[]) =>
  postMessage({ type: 'log', payload: args.join(' ') })
const error = (...args: unknown[]) =>
  postMessage({ type: 'error', payload: args.join(' ') })

onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data
  switch (type) {
    case 'init':
      init()
      break
    case 'exec':
      exec(payload)
      break
    default:
      error('Unknown message type', type)
  }
}

let db: Database

function init() {
  log('Initializing SQLite3 module...')
  sqlite3InitModule({
    print: log,
    printErr: error,
  })
    .then((sqlite3) => {
      log('Done initializing.')
      connect(sqlite3)
    })
    .then(() => {
      postMessage({ type: 'init' })
    })
}

function connect(sqlite3: Sqlite3Static) {
  log('Running SQLite3 version', sqlite3.version.libVersion)
  if ('opfs' in sqlite3) {
    db = new sqlite3.oo1.OpfsDb('/mydb.sqlite3')
    log('OPFS is available, created persisted database at', db.filename)
  } else {
    db = new sqlite3.oo1.DB('/mydb.sqlite3', 'ct')
    log('OPFS is not available, created transient database', db.filename)
  }
}

function exec(sql: string) {
  log('Executing SQL:', sql)
  const res = db.exec({ sql, returnValue: 'resultRows' })
  postMessage({ type: 'exec', payload: res })
}

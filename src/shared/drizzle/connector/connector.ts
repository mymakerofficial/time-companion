export interface DatabaseConnector {
  init(): Promise<void>
  exec(sql: string, bind?: Array<any>): Promise<{ rows: Array<any> }>
}

export function defineMigrator<TResult>(
  migrations: Array<(original: any) => any>,
) {
  return (original: any, version: number) => {
    let result = original
    for (let i = version; i < migrations.length; i++) {
      result = migrations[i](result)
    }
    return result as TResult
  }
}

export type Nullable<T> = T | null
export type Optional<T> = T | undefined

export type Pair<T1, T2> = [T1, T2]

export type ValueOrGetter<T> = T | (() => T)

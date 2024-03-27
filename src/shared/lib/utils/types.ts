export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = Nullable<Optional<T>>

export type Pair<T1, T2> = [T1, T2]

export type ValueOrGetter<T> = T | (() => T)
export type ErrorOrString = Error | string

import type { ValueOrGetter } from '@shared/lib/utils/types'
import { toValue } from '@shared/lib/utils/result'

type ResultSuccess<TValue> = {
  isError: false
  isSuccess: true
  value: TValue
}

type ResultError<TError> = {
  isError: true
  isSuccess: false
  error: TError
}

export type Result<TValue, TError> = ResultSuccess<TValue> | ResultError<TError>

export function resultSuccess<TValue>(value: TValue): Result<TValue, never> {
  return { isError: false, isSuccess: true, value }
}

export function resultError<TError>(error: TError): Result<never, TError> {
  return { isError: true, isSuccess: false, error }
}

export function isResultSuccess<TValue, TError>(
  result: Result<TValue, TError>,
): result is ResultSuccess<TValue> {
  return result.isSuccess
}

export function isResultError<TValue, TError>(
  result: Result<TValue, TError>,
): result is ResultError<TError> {
  return result.isError
}

// returns a result with the value or an error if the getter throws
export function runResulting<TValue, TError>(
  valueOrGetter: ValueOrGetter<TValue>,
): Result<TValue, TError> {
  try {
    return resultSuccess(toValue(valueOrGetter))
  } catch (error: any) {
    return resultError(error)
  }
}

// returns a result with the value or an error if the getter throws
export async function asyncRunResulting<TValue, TError>(
  valueOrGetter: ValueOrGetter<Promise<TValue>>,
): Promise<Result<TValue, TError>> {
  return toValue(valueOrGetter)
    .then((value) => resultSuccess(value))
    .catch((error) => resultError(error))
}

// returns the value or throws the error
export function resolveResult<TValue, TError>(
  result: Result<TValue, TError>,
): TValue {
  if (isResultError(result)) {
    throw result.error
  }

  return result.value
}

// returns the value or throws the error
export async function asyncResolveResult<TValue, TError>(
  result: Promise<Result<TValue, TError>>,
): Promise<TValue> {
  return result.then(resolveResult)
}

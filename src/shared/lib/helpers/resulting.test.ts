import { describe, it, vi, expect } from 'vitest'
import {
  asyncRunResulting,
  resolveResult,
  resultError,
  resultSuccess,
  runResulting,
} from '@shared/lib/helpers/resulting'

describe('resulting', () => {
  describe('runResulting', () => {
    it('should return a success result', () => {
      const fn = vi.fn(() => 'value')

      const result = runResulting(fn)

      expect(result).toEqual({
        isError: false,
        isSuccess: true,
        value: 'value',
      })
    })

    it('should return an error result', () => {
      const error = new Error('error')

      const fn = vi.fn(() => {
        throw error
      })

      const result = runResulting(fn)

      expect(result).toEqual({
        isError: true,
        isSuccess: false,
        error: error,
      })
    })
  })

  describe('asyncRunResulting', () => {
    it('should return a success result', async () => {
      const fn = vi.fn(() => Promise.resolve('value'))

      const result = await asyncRunResulting(fn)

      expect(result).toEqual({
        isError: false,
        isSuccess: true,
        value: 'value',
      })
    })

    it('should return an error result', async () => {
      const error = new Error('error')

      const fn = vi.fn(() => Promise.reject(error))

      const result = await asyncRunResulting(fn)

      expect(result).toEqual({
        isError: true,
        isSuccess: false,
        error: error,
      })
    })
  })

  describe('resolveResult', () => {
    it('should return the value', () => {
      const result = resultSuccess('value')

      const value = resolveResult(result)

      expect(value).toBe('value')
    })

    it('should throw the error', () => {
      const error = new Error('error')

      const result = resultError(error)

      expect(() => resolveResult(result)).toThrowError(error)
    })
  })

  describe('asyncRunResulting', () => {
    it('should return a success result', async () => {
      const fn = vi.fn(() => Promise.resolve('value'))

      const result = await asyncRunResulting(fn)

      expect(result).toEqual({
        isError: false,
        isSuccess: true,
        value: 'value',
      })
    })

    it('should return an error result', async () => {
      const error = new Error('error')

      const fn = vi.fn(() => Promise.reject(error))

      const result = await asyncRunResulting(fn)

      expect(result).toEqual({
        isError: true,
        isSuccess: false,
        error: error,
      })
    })
  })
})

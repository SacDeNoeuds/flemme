import { describe, expect, it, vi } from 'vitest'
import { make } from './utils'

describe('on()', () => {
  const makeForm = make.recommended

  it('unsubscribes global subscription', () => {
    const form = makeForm({ initial: { name: 'jack' }, submit: async () => {} })
    const listener = vi.fn()
    const unsubscribe = form.on('change', listener)
    form.set('name', 'john')
    unsubscribe()
    form.set('name', 'freddy')
    expect(listener).toHaveBeenCalledOnce()
  })

  it('unsubscribes path-based subscription', () => {
    const form = makeForm({ initial: { name: 'jack' }, submit: async () => {} })
    const listener = vi.fn()
    const unsubscribe = form.on('change', 'name', listener)
    form.set('name', 'john')
    unsubscribe()
    form.set('name', 'freddy')
    expect(listener).toHaveBeenCalledOnce()
  })
})

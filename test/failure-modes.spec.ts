import { assert } from 'chai'

import { Options, builder } from '../src'

import { SYMBOL_TO, Settings } from './email/types'

import { noop } from 'lodash'

describe('failure-modes', () => {
  it('does not throw', () => {
    const test = () =>
      builder<Settings>([
        {
          [Options.Type]: SYMBOL_TO,
          [Options.Once]: true,
          // [Options.Keys]: ['to'],
          [Options.Reducer]: () => ({}),
          [Options.Interface]: (_) => ({
            noop() {
              noop()
            }
          })
        }
      ])

    assert.doesNotThrow(test)
  })

  it('throw / Options.Type', () => {
    const test = () =>
      builder<Settings>([
        {
          [Options.Type]: (noop as unknown) as typeof SYMBOL_TO,
          [Options.Once]: true,
          // [Options.Keys]: ['to'],
          [Options.Reducer]: () => ({}),
          [Options.Interface]: (_) => ({
            noop() {
              noop()
            }
          })
        }
      ])

    assert.throws(test, /\[Options.Type\]/)
  })

  it('throw / Options.Once', () => {
    const test = () =>
      builder<Settings>([
        {
          [Options.Type]: SYMBOL_TO,
          [Options.Once]: ('string' as unknown) as boolean,
          // [Options.Keys]: ['to'],
          [Options.Reducer]: () => ({}),
          [Options.Interface]: (_) => ({
            noop() {
              noop()
            }
          })
        }
      ])

    assert.throws(test, /\[Options.Once\]/)
  })

  it('throw / Options.Dependencies', () => {
    const test = () =>
      builder<Settings>([
        {
          [Options.Type]: SYMBOL_TO,
          [Options.Once]: true,
          // tslint:disable-next-line: no-any
          [Options.Dependencies]: [noop] as any,
          [Options.Reducer]: () => ({}),
          [Options.Interface]: (_) => ({
            noop() {
              noop()
            }
          })
        }
      ])

    assert.throws(test, /\[Options.Dependencies\]/)
  })

  it('throw / Options.Conflicts', () => {
    const test = () =>
      builder<Settings>([
        {
          [Options.Type]: SYMBOL_TO,
          [Options.Once]: true,
          // tslint:disable-next-line: no-any
          [Options.Conflicts]: [noop] as any,
          [Options.Reducer]: () => ({}),
          [Options.Interface]: (_) => ({
            noop() {
              noop()
            }
          })
        }
      ])

    assert.throws(test, /\[Options.Conflicts\]/)
  })

  it('throw / Options.Enabled', () => {
    const test = () =>
      builder<Settings>([
        {
          [Options.Type]: SYMBOL_TO,
          [Options.Once]: true,
          // tslint:disable-next-line: no-any
          [Options.Enabled]: 'string' as any,
          [Options.Reducer]: () => ({}),
          [Options.Interface]: (_) => ({
            noop() {
              noop()
            }
          })
        }
      ])

    assert.throws(test, /\[Options.Enabled\]/)
  })

  it('throw / Options.Reducer', () => {
    const test = () =>
      builder<Settings>([
        {
          [Options.Type]: SYMBOL_TO,
          [Options.Once]: true,
          // tslint:disable-next-line: no-any
          [Options.Reducer]: 'string' as any,
          [Options.Interface]: (_) => ({
            noop() {
              noop()
            }
          })
        }
      ])

    assert.throws(test, /\[Options.Reducer\]/)
  })

  it('throw / Options.InitialState', () => {
    const test = () =>
      builder<Settings>([
        {
          [Options.Type]: SYMBOL_TO,
          [Options.Once]: true,
          // tslint:disable-next-line: no-any
          [Options.InitialState]: noop as any,
          [Options.Interface]: (_) => ({
            noop() {
              noop()
            }
          })
        }
      ])

    assert.throws(test, /\[Options.InitialState\]/)
  })

  it('throw / FSA Type', () => {
    const test = () =>
      builder<Settings>([
        {
          [Options.Type]: SYMBOL_TO,
          [Options.Once]: true,
          [Options.Interface]: (dispatch) => ({
            to(payload: string) {
              dispatch({ type: (noop as unknown) as typeof SYMBOL_TO, payload })
            }
          })
        }
      ])().to('jane.doe@example.com')

    assert.throws(test, /FSA/)
  })
})

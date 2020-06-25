import { TL } from '@escapace/typelevel'
import { assert } from 'chai'
import { noop } from 'lodash'
import { builder, log, Options, SYMBOL_LOG, SYMBOL_STATE, state } from '../src'
import { email } from './email'
import { ActionTo, InitialState, Settings, SYMBOL_TO } from './email/types'

describe('failure-modes', () => {
  it('mutation', () => {
    const instance = email()

    instance.to('jane.doe@example.com')

    const test = instance.to('john.doe@example.com')

    const _log: Array<ActionTo<'john.doe@example.com'>> = log(test)
    const _state: TL.Assign<
      InitialState,
      { to: 'john.doe@example.com' }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['subject', 'plugin', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.subject)
    assert.lengthOf(_log, 1)
    assert.deepInclude(_log, {
      type: SYMBOL_TO,
      payload: 'john.doe@example.com'
    })
    assert.deepEqual(_state, {
      body: undefined,
      plugins: [],
      sent: false,
      subject: undefined,
      to: 'john.doe@example.com'
    })
  })

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

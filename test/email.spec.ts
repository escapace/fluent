import { attachment, cc, email } from './email'
import {
  type ActionBody,
  type ActionSend,
  type ActionSubject,
  type ActionTo,
  type InitialState,
  SYMBOL_BODY,
  SYMBOL_SEND,
  SYMBOL_SUBJECT,
  SYMBOL_TO,
} from './email/types'

import { type ActionCC, SYMBOL_CC } from './email/cc'
import { type ActionAttachment, SYMBOL_ATTACHMENT } from './email/attachment'
import { type ActionPlugin, SYMBOL_PLUGIN } from './email/plugin'

import type $ from '@escapace/typelevel'

import { SYMBOL_LOG, SYMBOL_STATE, log, state } from '../src'

import { assert, describe, it } from 'vitest'

describe('email', () => {
  it('initial', () => {
    assert.isFunction(email)
  })

  it('stage 0', () => {
    const test = email()

    const _log: [never] = log(test)
    const _state: InitialState = state(test)

    // const qwe = _state.cc

    assert.isObject(test)
    assert.hasAllKeys(test, ['to', 'plugin', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.to)
    assert.isEmpty(_log)
    assert.deepEqual(_state, {
      body: undefined,
      plugins: [],
      sent: false,
      subject: undefined,
      to: undefined,
    })
  })

  it('stage 1', () => {
    const test = email().to('john.doe@example.com')

    const _log: [ActionTo<'john.doe@example.com'>] = log(test)
    const _state: $.Assign<InitialState, { to: 'john.doe@example.com' }> = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['subject', 'plugin', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.subject)
    assert.lengthOf(_log, 1)
    assert.deepInclude(_log, {
      payload: 'john.doe@example.com',
      type: SYMBOL_TO,
    })
    assert.deepEqual(_state, {
      body: undefined,
      plugins: [],
      sent: false,
      subject: undefined,
      to: 'john.doe@example.com',
    })
  })

  it('stage 2', () => {
    const test = email().to('john.doe@example.com').subject('Hello World')

    const _log: [ActionSubject<'Hello World'>, ActionTo<'john.doe@example.com'>] = log(test)

    const _state: $.Assign<InitialState, { subject: 'Hello World'; to: 'john.doe@example.com' }> =
      state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['body', 'plugin', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.body)
    assert.lengthOf(_log, 2)
    assert.deepInclude(_log, {
      payload: 'Hello World',
      type: SYMBOL_SUBJECT,
    })
    assert.deepEqual(_state, {
      body: undefined,
      plugins: [],
      sent: false,
      subject: 'Hello World',
      to: 'john.doe@example.com',
    })
  })

  it('stage 3', () => {
    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')
      .body('Totam est perferendis provident consequatur et harum autem.')

    const _log: [
      ActionBody<'Totam est perferendis provident consequatur et harum autem.'>,
      ActionSubject<'Hello World'>,
      ActionTo<'john.doe@example.com'>,
    ] = log(test)

    const _state: $.Assign<
      InitialState,
      {
        body: 'Totam est perferendis provident consequatur et harum autem.'
        subject: 'Hello World'
        to: 'john.doe@example.com'
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['send', 'plugin', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.send)
    assert.lengthOf(_log, 3)
    assert.deepInclude(_log, {
      payload: 'Totam est perferendis provident consequatur et harum autem.',
      type: SYMBOL_BODY,
    })
    assert.deepEqual(_state, {
      body: 'Totam est perferendis provident consequatur et harum autem.',
      plugins: [],
      sent: false,
      subject: 'Hello World',
      to: 'john.doe@example.com',
    })
  })

  it('stage 4', () => {
    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')
      .body('Totam est perferendis provident consequatur et harum autem.')
      .send()

    const _log: [
      ActionSend,
      ActionBody<'Totam est perferendis provident consequatur et harum autem.'>,
      ActionSubject<'Hello World'>,
      ActionTo<'john.doe@example.com'>,
    ] = log(test)
    const _state: $.Assign<
      InitialState,
      {
        body: 'Totam est perferendis provident consequatur et harum autem.'
        sent: true
        subject: 'Hello World'
        to: 'john.doe@example.com'
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, [SYMBOL_LOG, SYMBOL_STATE])
    assert.lengthOf(_log, 4)
    assert.deepInclude(_log, {
      payload: true,
      type: SYMBOL_SEND,
    })
    assert.deepEqual(_state, {
      body: 'Totam est perferendis provident consequatur et harum autem.',
      plugins: [],
      sent: true,
      subject: 'Hello World',
      to: 'john.doe@example.com',
    })
  })

  it('stage 4', () => {
    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')
      .body('Totam est perferendis provident consequatur et harum autem.')
      .send()

    const _log: [
      ActionSend,
      ActionBody<'Totam est perferendis provident consequatur et harum autem.'>,
      ActionSubject<'Hello World'>,
      ActionTo<'john.doe@example.com'>,
    ] = log(test)
    const _state: $.Assign<
      InitialState,
      {
        body: 'Totam est perferendis provident consequatur et harum autem.'
        sent: true
        subject: 'Hello World'
        to: 'john.doe@example.com'
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, [SYMBOL_LOG, SYMBOL_STATE])
    assert.lengthOf(_log, 4)
    assert.deepInclude(_log, {
      payload: true,
      type: SYMBOL_SEND,
    })
    assert.deepEqual(_state, {
      body: 'Totam est perferendis provident consequatur et harum autem.',
      plugins: [],
      sent: true,
      subject: 'Hello World',
      to: 'john.doe@example.com',
    })
  })

  it('plugin', () => {
    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')
      .body('Totam est perferendis provident consequatur et harum autem.')
      .plugin(cc, attachment)

    const _log: [
      ActionPlugin<Array<typeof SYMBOL_ATTACHMENT | typeof SYMBOL_CC>>,
      ActionBody<'Totam est perferendis provident consequatur et harum autem.'>,
      ActionSubject<'Hello World'>,
      ActionTo<'john.doe@example.com'>,
    ] = log(test)

    const _state: $.Assign<
      InitialState,
      {
        body: 'Totam est perferendis provident consequatur et harum autem.'
        cc?: []
        plugins: Array<typeof SYMBOL_ATTACHMENT | typeof SYMBOL_CC>
        subject: 'Hello World'
        to: 'john.doe@example.com'
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['send', 'plugin', 'attachment', 'cc', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.send)
    assert.isFunction(test.attachment)
    assert.isFunction(test.cc)
    assert.lengthOf(_log, 4)
    assert.deepInclude(_log, {
      payload: [SYMBOL_CC, SYMBOL_ATTACHMENT],
      type: SYMBOL_PLUGIN,
    })
    assert.deepEqual(_state, {
      body: 'Totam est perferendis provident consequatur et harum autem.',
      cc: [],
      plugins: [SYMBOL_CC, SYMBOL_ATTACHMENT],
      sent: false,
      subject: 'Hello World',
      to: 'john.doe@example.com',
    })
  })

  it('cc plugin', () => {
    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')
      .body('Totam est perferendis provident consequatur et harum autem.')
      .plugin(cc, attachment)
      .cc('jane.doe@example.com')
      .cc('justin.doe@example.com')

    const _log: Array<
      | ActionBody<'Totam est perferendis provident consequatur et harum autem.'>
      | ActionCC<'jane.doe@example.com'>
      | ActionCC<'justin.doe@example.com'>
      | ActionPlugin<Array<typeof SYMBOL_ATTACHMENT | typeof SYMBOL_CC>>
      | ActionSubject<'Hello World'>
      | ActionTo<'john.doe@example.com'>
    > = log(test)

    const _state: $.Assign<
      InitialState,
      {
        body: 'Totam est perferendis provident consequatur et harum autem.'
        cc?: Array<'jane.doe@example.com' | 'justin.doe@example.com'>
        plugins: Array<typeof SYMBOL_ATTACHMENT | typeof SYMBOL_CC>
        subject: 'Hello World'
        to: 'john.doe@example.com'
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['send', 'plugin', 'attachment', 'cc', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.send)
    assert.isFunction(test.attachment)
    assert.isFunction(test.cc)
    assert.lengthOf(_log, 6)

    assert.deepInclude(_log, {
      payload: 'jane.doe@example.com',
      type: SYMBOL_CC,
    })

    assert.deepInclude(_log, {
      payload: 'justin.doe@example.com',
      type: SYMBOL_CC,
    })

    assert.deepEqual(_state, {
      body: 'Totam est perferendis provident consequatur et harum autem.',
      cc: ['justin.doe@example.com', 'jane.doe@example.com'],
      plugins: [SYMBOL_CC, SYMBOL_ATTACHMENT],
      sent: false,
      subject: 'Hello World',
      to: 'john.doe@example.com',
    })
  })

  it('attachment plugin', () => {
    const attachment1 = Buffer.from('An Attachment')
    const attachment2 = Buffer.from('Another Attachment')

    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')
      .body('Totam est perferendis provident consequatur et harum autem.')
      .plugin(cc, attachment)
      .attachment(attachment1)
      .attachment(attachment2)

    const _log: Array<
      | ActionAttachment
      | ActionBody<'Totam est perferendis provident consequatur et harum autem.'>
      | ActionPlugin<Array<typeof SYMBOL_ATTACHMENT | typeof SYMBOL_CC>>
      | ActionSubject<'Hello World'>
      | ActionTo<'john.doe@example.com'>
    > = log(test)

    const _state: $.Assign<
      InitialState,
      {
        body: 'Totam est perferendis provident consequatur et harum autem.'
        cc?: []
        plugins: Array<typeof SYMBOL_ATTACHMENT | typeof SYMBOL_CC>
        subject: 'Hello World'
        to: 'john.doe@example.com'
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['send', 'plugin', 'attachment', 'cc', SYMBOL_LOG, SYMBOL_STATE])

    assert.isFunction(test.send)
    assert.isFunction(test.attachment)
    assert.isFunction(test.cc)
    assert.lengthOf(_log, 6)

    assert.deepInclude(_log, {
      payload: attachment1,
      type: SYMBOL_ATTACHMENT,
    })

    assert.deepInclude(_log, {
      payload: attachment2,
      type: SYMBOL_ATTACHMENT,
    })

    assert.deepEqual(_state, {
      body: 'Totam est perferendis provident consequatur et harum autem.',
      cc: [],
      plugins: [SYMBOL_CC, SYMBOL_ATTACHMENT],
      sent: false,
      subject: 'Hello World',
      to: 'john.doe@example.com',
    })
  })
})

// const qwe = email()
// .to('john.doe@example.com')
// .subject('hello')
// .body('hi john doe')
// .plugin(cc, attachment)
// .attachment(Buffer.from('Hi'))
// .cc('1@example.com')
// .cc('2@example.com')
// .cc('3@example.com')
// .cc('4@example.com')
// .cc('5@example.com')
// .cc('6@example.com')
// .cc('7@example.com')
// .cc('8@example.com')
// .cc('9@example.com')
// .cc('10@example.com')
// .cc('11@example.com')
// .cc('12@example.com')
// .cc('13@example.com')
// .cc('14@example.com')
// .cc('15@example.com')
// .cc('16@example.com')
// .cc('17@example.com')
// .cc('18@example.com')
// .cc('19@example.com')
// .cc('20@example.com')
// .cc('21@example.com')
// .cc('22@example.com')
// .cc('23@example.com')
// .cc('24@example.com')
// .cc('25@example.com')
// .cc('26@example.com')
// .cc('27@example.com')
// .cc('28@example.com')
// .cc('29@example.com')
// .cc('30@example.com')
// .cc('31@example.com')
// .cc('32@example.com')
// .cc('33@example.com')
// .cc('34@example.com')
// .cc('35@example.com')
// .cc('35@example.com')
// .cc('35@example.com')
// .cc('35@example.com')
// .cc('35@example.com')
// .cc('35@example.com')
// .send()

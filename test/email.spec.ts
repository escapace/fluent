import { attachment, cc, email } from './email'
import {
  ActionBody,
  ActionPlugin,
  ActionSend,
  ActionSubject,
  ActionTo,
  INITIAL_STATE,
  Types
} from './email/types'

import { ActionCC } from './email/cc'
import { ActionAttachment } from './email/attachment'

import { TL } from '@escapace/typelevel'

import { SYMBOL_LOG, SYMBOL_STATE, log, state } from '../src'

import { assert } from 'chai'

describe('email', () => {
  it('initial', () => {
    assert.isFunction(email)
  })

  it('stage 0', () => {
    const test = email()

    const _log: never[] = log(test)
    const _state: INITIAL_STATE = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['to', 'plugin', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.to)
    assert.isEmpty(_log)
    assert.deepEqual(_state, {
      body: undefined,
      plugins: [],
      sent: false,
      subject: undefined,
      to: undefined
    })
  })

  it('stage 1', () => {
    const test = email().to('john.doe@example.com')

    const _log: Array<ActionTo<'john.doe@example.com'>> = log(test)
    const _state: TL.Assign<
      INITIAL_STATE,
      { to: 'john.doe@example.com' }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['subject', 'plugin', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.subject)
    assert.lengthOf(_log, 1)
    assert.deepInclude(_log, {
      type: Types.To,
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

  it('stage 2', () => {
    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')

    const _log: Array<
      ActionTo<'john.doe@example.com'> | ActionSubject<'Hello World'>
    > = log(test)
    const _state: TL.Assign<
      INITIAL_STATE,
      { to: 'john.doe@example.com'; subject: 'Hello World' }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['body', 'plugin', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.body)
    assert.lengthOf(_log, 2)
    assert.deepInclude(_log, {
      type: Types.Subject,
      payload: 'Hello World'
    })
    assert.deepEqual(_state, {
      body: undefined,
      plugins: [],
      sent: false,
      subject: 'Hello World',
      to: 'john.doe@example.com'
    })
  })

  it('stage 3', () => {
    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')
      .body('Totam est perferendis provident consequatur et harum autem.')

    const _log: Array<
      | ActionTo<'john.doe@example.com'>
      | ActionSubject<'Hello World'>
      | ActionBody<
          'Totam est perferendis provident consequatur et harum autem.'
        >
    > = log(test)
    const _state: TL.Assign<
      INITIAL_STATE,
      {
        to: 'john.doe@example.com'
        subject: 'Hello World'
        body: 'Totam est perferendis provident consequatur et harum autem.'
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, ['send', 'plugin', SYMBOL_LOG, SYMBOL_STATE])
    assert.isFunction(test.send)
    assert.lengthOf(_log, 3)
    assert.deepInclude(_log, {
      type: Types.Body,
      payload: 'Totam est perferendis provident consequatur et harum autem.'
    })
    assert.deepEqual(_state, {
      body: 'Totam est perferendis provident consequatur et harum autem.',
      plugins: [],
      sent: false,
      subject: 'Hello World',
      to: 'john.doe@example.com'
    })
  })

  it('stage 4', () => {
    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')
      .body('Totam est perferendis provident consequatur et harum autem.')
      .send()

    const _log: Array<
      | ActionTo<'john.doe@example.com'>
      | ActionSubject<'Hello World'>
      | ActionBody<
          'Totam est perferendis provident consequatur et harum autem.'
        >
      | ActionSend
    > = log(test)
    const _state: TL.Assign<
      INITIAL_STATE,
      {
        to: 'john.doe@example.com'
        subject: 'Hello World'
        body: 'Totam est perferendis provident consequatur et harum autem.'
        sent: true
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, [SYMBOL_LOG, SYMBOL_STATE])
    assert.lengthOf(_log, 4)
    assert.deepInclude(_log, {
      type: Types.Send,
      payload: true
    })
    assert.deepEqual(_state, {
      body: 'Totam est perferendis provident consequatur et harum autem.',
      plugins: [],
      sent: true,
      subject: 'Hello World',
      to: 'john.doe@example.com'
    })
  })

  it('stage 4', () => {
    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')
      .body('Totam est perferendis provident consequatur et harum autem.')
      .send()

    const _log: Array<
      | ActionTo<'john.doe@example.com'>
      | ActionSubject<'Hello World'>
      | ActionBody<
          'Totam est perferendis provident consequatur et harum autem.'
        >
      | ActionSend
    > = log(test)
    const _state: TL.Assign<
      INITIAL_STATE,
      {
        to: 'john.doe@example.com'
        subject: 'Hello World'
        body: 'Totam est perferendis provident consequatur et harum autem.'
        sent: true
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, [SYMBOL_LOG, SYMBOL_STATE])
    assert.lengthOf(_log, 4)
    assert.deepInclude(_log, {
      type: Types.Send,
      payload: true
    })
    assert.deepEqual(_state, {
      body: 'Totam est perferendis provident consequatur et harum autem.',
      plugins: [],
      sent: true,
      subject: 'Hello World',
      to: 'john.doe@example.com'
    })
  })

  it('plugin', () => {
    const test = email()
      .to('john.doe@example.com')
      .subject('Hello World')
      .body('Totam est perferendis provident consequatur et harum autem.')
      .plugin(cc, attachment)

    const _log: Array<
      | ActionTo<'john.doe@example.com'>
      | ActionSubject<'Hello World'>
      | ActionBody<
          'Totam est perferendis provident consequatur et harum autem.'
        >
      | ActionPlugin<Array<Types.CC | Types.Attachment>>
    > = log(test)

    const _state: TL.Assign<
      INITIAL_STATE,
      {
        to: 'john.doe@example.com'
        subject: 'Hello World'
        body: 'Totam est perferendis provident consequatur et harum autem.'
        plugins: Array<Types.CC | Types.Attachment>
        cc: [] | undefined
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, [
      'send',
      'plugin',
      'attachment',
      'cc',
      SYMBOL_LOG,
      SYMBOL_STATE
    ])
    assert.isFunction(test.send)
    assert.isFunction(test.attachment)
    assert.isFunction(test.cc)
    assert.lengthOf(_log, 4)
    assert.deepInclude(_log, {
      type: 'Plugin' as Types.Plugin,
      payload: ['CC' as Types.CC, 'Attachment' as Types.Attachment]
    })
    assert.deepEqual(_state, {
      cc: [],
      body: 'Totam est perferendis provident consequatur et harum autem.',
      plugins: ['CC' as Types.CC, 'Attachment' as Types.Attachment],
      sent: false,
      subject: 'Hello World',
      to: 'john.doe@example.com'
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
      | ActionTo<'john.doe@example.com'>
      | ActionSubject<'Hello World'>
      | ActionBody<
          'Totam est perferendis provident consequatur et harum autem.'
        >
      | ActionPlugin<Array<Types.CC | Types.Attachment>>
      | ActionCC<'jane.doe@example.com'>
      | ActionCC<'justin.doe@example.com'>
    > = log(test)

    const _state: TL.Assign<
      INITIAL_STATE,
      {
        to: 'john.doe@example.com'
        subject: 'Hello World'
        body: 'Totam est perferendis provident consequatur et harum autem.'
        plugins: Array<Types.CC | Types.Attachment>
        cc: Array<'jane.doe@example.com' | 'justin.doe@example.com'> | undefined
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, [
      'send',
      'plugin',
      'attachment',
      'cc',
      SYMBOL_LOG,
      SYMBOL_STATE
    ])
    assert.isFunction(test.send)
    assert.isFunction(test.attachment)
    assert.isFunction(test.cc)
    assert.lengthOf(_log, 6)

    assert.deepInclude(_log, {
      type: 'CC' as Types.CC,
      payload: 'jane.doe@example.com'
    })

    assert.deepInclude(_log, {
      type: 'CC' as Types.CC,
      payload: 'justin.doe@example.com'
    })

    assert.deepEqual(_state, {
      body: 'Totam est perferendis provident consequatur et harum autem.',
      plugins: ['CC' as Types.CC, 'Attachment' as Types.Attachment],
      sent: false,
      subject: 'Hello World',
      to: 'john.doe@example.com',
      cc: ['justin.doe@example.com', 'jane.doe@example.com']
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
      | ActionTo<'john.doe@example.com'>
      | ActionSubject<'Hello World'>
      | ActionBody<
          'Totam est perferendis provident consequatur et harum autem.'
        >
      | ActionPlugin<Array<Types.CC | Types.Attachment>>
      | ActionAttachment
    > = log(test)

    const _state: TL.Assign<
      INITIAL_STATE,
      {
        to: 'john.doe@example.com'
        subject: 'Hello World'
        body: 'Totam est perferendis provident consequatur et harum autem.'
        plugins: Array<Types.CC | Types.Attachment>
        cc: [] | undefined
      }
    > = state(test)

    assert.isObject(test)
    assert.hasAllKeys(test, [
      'send',
      'plugin',
      'attachment',
      'cc',
      SYMBOL_LOG,
      SYMBOL_STATE
    ])

    assert.isFunction(test.send)
    assert.isFunction(test.attachment)
    assert.isFunction(test.cc)
    assert.lengthOf(_log, 6)

    assert.deepInclude(_log, {
      type: 'Attachment' as Types.Attachment,
      payload: attachment1
    })

    assert.deepInclude(_log, {
      type: 'Attachment' as Types.Attachment,
      payload: attachment2
    })

    assert.deepEqual(_state, {
      cc: [],
      body: 'Totam est perferendis provident consequatur et harum autem.',
      plugins: ['CC' as Types.CC, 'Attachment' as Types.Attachment],
      sent: false,
      subject: 'Hello World',
      to: 'john.doe@example.com'
    })
  })
})

// .plugin(Types.CC, Types.Attachment)
// .attachment('Hello')
// .attachment('Hello2')
// .cc('1@example.com')
// .cc('2@example.com')
// .cc('3@example.com')
// .cc('4@example.com')
// .cc('5@example.com')
// .cc('6@example.com')
// .cc('7@example.com')
//   .cc('8@example.com')
//   .cc('9@example.com')
//   .cc('10@example.com')
//   .cc('11@example.com')
//   .cc('12@example.com')
//   .cc('13@example.com')
//   .cc('14@example.com')
//   .cc('15@example.com')
//   .cc('16@example.com')
//   .cc('17@example.com')
//   .cc('18@example.com')
//   .cc('19@example.com')
//   .cc('20@example.com')
//   .cc('21@example.com')
//   .cc('22@example.com')
//   .cc('23@example.com')
//   .cc('24@example.com')
//   .cc('25@example.com')
//   .cc('26@example.com')
//   .cc('27@example.com')
//   .cc('28@example.com')
//   .cc('29@example.com')
//   .cc('30@example.com')
//   .cc('31@example.com')
//   .cc('32@example.com')
//   .cc('33@example.com')
//   .cc('34@example.com')
//   .cc('35@example.com')
//   .cc('35@example.com')
//   .cc('35@example.com')
//   .cc('35@example.com')
//   .cc('35@example.com')
//   .cc('35@example.com')
//   .send()

// const qwe  = email()
//   .to('john.doe@example.com')
//   .subject('hello')
//   .body('hi john doe')
//   .plugin(attachment)
// .attachment('qweqweqwee1')
// .attachment('qweqweqwee2')
// .attachment('qweqweqwee3')
// .attachment('qweqweqwee4')
// .attachment('qweqweqwee5')
// .attachment('qweqweqwee6')
// .attachment('qweqweqwee7')
// .attachment('qweqweqwee8')
// .attachment('qweqweqwee9')
// .attachment('qweqweqwee10')
// .attachment('qweqweqwee11')
// .attachment('qweqweqwee12')
// .attachment('qweqweqwee13')
// .attachment('qweqweqwee14')
// .attachment('qweqweqwee15')
// .attachment('qweqweqwee16')
// .attachment('qweqweqwee17')
// .attachment('qweqweqwee19')
// .attachment('aqweqweqwee10')
// .attachment('aqweqweqwee11')
// .attachment('aqweqweqwee12')
// .attachment('aqweqweqwee13')
// .attachment('aqweqweqwee14')
// .attachment('aqweqweqwee15')
// .attachment('aqweqweqwee16')
// .attachment('aqweqweqwee17')
// .attachment('aqweqweqwee19')
// .send()

// console.log(newEmail)
// console.log(newEmail2)

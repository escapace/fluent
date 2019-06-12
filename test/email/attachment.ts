import { SYMBOL_SUBJECT, Settings } from './types'

import $ from '@escapace/typelevel'

import { Model, Next, Options, Plugin } from '../../src'

import { includes } from 'lodash'

export const SYMBOL_ATTACHMENT = Symbol.for('Attachment')

export interface ActionAttachment {
  type: typeof SYMBOL_ATTACHMENT
  payload: Buffer
}

declare module './types' {
  export interface Email<T> {
    attachment(payload: Buffer): Next<Settings, T, ActionAttachment>
  }

  export interface Category<T extends Model<State>> {
    [SYMBOL_ATTACHMENT]: {
      [Options.Type]: typeof SYMBOL_ATTACHMENT
      [Options.Once]: $.False
      [Options.Dependencies]: typeof SYMBOL_SUBJECT
      [Options.Keys]: 'attachment'
      [Options.Enabled]: $.Contains<
        $.Values<T['state']['plugins']>,
        typeof SYMBOL_ATTACHMENT
      >
      [Options.Conflicts]: typeof SYMBOL_SEND
    }
  }
}

export const attachment: Plugin<typeof SYMBOL_ATTACHMENT, Settings> = {
  [Options.Type]: SYMBOL_ATTACHMENT,
  [Options.Once]: false,
  [Options.Keys]: ['attachment'],
  [Options.Dependencies]: [SYMBOL_SUBJECT],
  [Options.Enabled]: (_, state) => includes(state.plugins, SYMBOL_ATTACHMENT),
  [Options.Interface]: dispatch => ({
    attachment(value: Buffer) {
      return dispatch<ActionAttachment>({
        type: SYMBOL_ATTACHMENT,
        payload: value
      })
    }
  })
}

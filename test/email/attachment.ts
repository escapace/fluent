import { SYMBOL_SUBJECT, type Settings } from './types'

import type $ from '@escapace/typelevel'

import { type Model, type Next, Options, type Plugin } from '../../src'

import { includes } from 'lodash-es'

export const SYMBOL_ATTACHMENT = Symbol.for('Attachment')

export interface ActionAttachment {
  payload: Buffer
  type: typeof SYMBOL_ATTACHMENT
}

declare module './types' {
  export interface Email<T> {
    attachment(payload: Buffer): Next<Settings, T, ActionAttachment>
  }

  export interface Category<T extends Model<State>> {
    [SYMBOL_ATTACHMENT]: {
      [Options.Conflicts]: typeof SYMBOL_SEND
      [Options.Dependencies]: typeof SYMBOL_SUBJECT
      [Options.Enabled]: $.Contains<
        $.Values<T['state']['plugins']>,
        typeof SYMBOL_ATTACHMENT
      >
      [Options.Keys]: 'attachment'
      [Options.Once]: $.False
      [Options.Type]: typeof SYMBOL_ATTACHMENT
    }
  }
}

export const attachment: Plugin<typeof SYMBOL_ATTACHMENT, Settings> = {
  [Options.Dependencies]: [SYMBOL_SUBJECT],
  [Options.Enabled]: (_, state) => includes(state.plugins, SYMBOL_ATTACHMENT),
  [Options.Interface]: (dispatch) => ({
    attachment(value: Buffer) {
      return dispatch<ActionAttachment>({
        payload: value,
        type: SYMBOL_ATTACHMENT
      })
    }
  }),
  [Options.Keys]: ['attachment'],
  [Options.Once]: false,
  [Options.Type]: SYMBOL_ATTACHMENT
}

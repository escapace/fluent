import { Settings, Types } from './types'

import $ from '@escapace/typelevel'

import { Model, Next, Options, Plugin } from '../../src'

import { includes } from 'lodash'

export interface ActionAttachment {
  type: Types.Attachment
  payload: Buffer
}

declare module './types' {
  enum Types {
    Attachment = 'Attachment'
  }

  export interface Email<T> {
    attachment(
      payload: Buffer
    ): Next<Settings, T, ActionAttachment>
  }

  export interface Category<
    T extends Model<State>
  > {
    [Types.Attachment]: {
      [Options.Type]: Types.Attachment
      [Options.Once]: $.False
      [Options.Dependencies]: Types.Subject
      [Options.Keys]: 'attachment'
      [Options.Enabled]: $.Contains<
        $.Values<T['state']['plugins']>,
        Types.Attachment
      >
      [Options.Conflicts]: Types.Send
    }
  }
}

export const attachment: Plugin<Types.Attachment, Settings> = {
    [Options.Type]: 'Attachment' as Types.Attachment,
    [Options.Once]: false,
    [Options.Keys]: ['attachment'],
    [Options.Dependencies]: [Types.Subject],
    [Options.Enabled]: (_, state) => includes(state.plugins, 'Attachment' as Types.Attachment),
    [Options.Interface]: dispatch => ({
      attachment(value: Buffer) {
        return dispatch<ActionAttachment>({ type: 'Attachment' as Types.Attachment, payload: value })
      }
    })
  }

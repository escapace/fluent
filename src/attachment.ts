import { Types } from './types'

import { TL } from '@escapace/typelevel'

import { Model, Next, Options } from './lib'

interface ActionAttachment<T extends string> {
  type: Types.Attachment
  payload: T
}

declare module './types' {
  enum Types {
    Attachment = 'Attachment'
  }

  export interface Email<T> {
    attachment<U extends string>(
      payload: U
    ): Next<Settings, T, ActionAttachment<U>>
  }

  export interface Category<
    _T,
    T extends Model<State> = TL.Cast<_T, Model<State>>
  > {
    [Types.Attachment]: {
      [Options.TYPE]: Types.Attachment
      [Options.ONCE]: TL.False
      [Options.DEPENDENCIES]: Types.Subject
      [Options.KEYS]: 'attachment'
      [Options.ENABLED]: TL.Contains<TL.Values<T['state']['plugins']>, Types.Attachment>
      [Options.CONFLICTS]: Types.Send
    }
  }
}
